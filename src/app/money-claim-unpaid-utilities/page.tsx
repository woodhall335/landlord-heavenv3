import type { Metadata } from 'next';
import Link from 'next/link';
import { getCanonicalUrl } from '@/lib/seo/urls';
import { StructuredData, breadcrumbSchema, articleSchema } from '@/lib/seo/structured-data';
import {
  CheckCircle,
  ArrowRight,
  AlertTriangle,
  Zap,
  FileText,
  PoundSterling,
  Droplets,
  Flame,
  Wifi,
  ClipboardList,
} from 'lucide-react';
import { FAQSection } from '@/components/seo/FAQSection';
import { NextLegalSteps } from '@/components/seo/NextLegalSteps';
import { productLinks, toolLinks } from '@/lib/seo/internal-links';

export const metadata: Metadata = {
  title: 'Claim Unpaid Utilities from Tenant 2026 | Bills & Energy Recovery',
  description:
    'Recover unpaid gas, electricity, water bills from tenants. When landlords are liable and how to make a court claim.',
  keywords: [
    'tenant unpaid utilities',
    'landlord utility bills',
    'recover utility costs tenant',
    'tenant left unpaid bills',
    'electricity bill tenant',
    'gas bill tenant claim',
    'water bill tenant',
    'utility arrears claim',
    'MCOL utility bills',
    'tenant energy debt',
  ],
  openGraph: {
    title: 'Claim Unpaid Utilities from Tenant 2026 | Bills & Energy Recovery',
    description:
      'Landlord guide to recovering unpaid utility bills from tenants through the courts in England, Wales, and Scotland.',
    type: 'article',
    url: getCanonicalUrl('/money-claim-unpaid-utilities'),
  },
  alternates: {
    canonical: getCanonicalUrl('/money-claim-unpaid-utilities'),
  },
};

const faqs = [
  {
    question: 'Am I liable for my tenant\'s unpaid utility bills?',
    answer:
      'It depends on the contract. If utilities are in your name as landlord, you\'re liable to the supplier - but you can claim reimbursement from the tenant. If utilities are in the tenant\'s name, they\'re directly liable to the supplier and it\'s not your debt. Check who the account holder is.',
  },
  {
    question: 'Can I claim for utilities if bills are in the tenant\'s name?',
    answer:
      'Not usually. If the tenant has a direct contract with the utility company, that debt is between them. However, if your tenancy agreement required the tenant to pay utilities and they haven\'t (causing you loss), you might have a breach of contract claim - but this is complex.',
  },
  {
    question: 'What if utilities are included in the rent?',
    answer:
      'If utilities are included in rent and you\'ve paid bills the tenant should have covered through rent, you can claim this as unpaid rent or as a separate utilities debt. Document what portion of rent covers utilities in your tenancy agreement.',
  },
  {
    question: 'Can I recover utility costs from the deposit?',
    answer:
      'Yes, if you have evidence the tenant was responsible for paying and didn\'t. You\'ll need: bills showing the period and amounts, proof utilities were tenant\'s responsibility (tenancy agreement clause), and evidence they didn\'t pay. Use deposit scheme dispute resolution first.',
  },
  {
    question: 'What about water bills - aren\'t landlords always liable?',
    answer:
      'Water companies can hold landlords liable if the tenant doesn\'t pay (unlike gas and electricity). However, you can still claim the money back from the tenant if the tenancy agreement made them responsible. Keep records of what you\'ve had to pay.',
  },
  {
    question: 'Can I claim for broadband or TV packages left unpaid?',
    answer:
      'If the contract is in your name and the tenant was responsible for payment under the tenancy agreement, yes. If the contract was in the tenant\'s name, that\'s their direct debt to the provider and not your claim to make.',
  },
  {
    question: 'How do I prove the tenant owes utility money?',
    answer:
      'You need: the tenancy agreement showing tenant responsibility for utilities, utility bills covering the tenancy period, proof the bills are unpaid (final demands, your payment records), and any correspondence with the tenant about payments.',
  },
  {
    question: 'Can the tenant dispute the utility amounts?',
    answer:
      'Yes. They might argue the usage was already high when they moved in, that you estimated rather than used actual readings, or that they did pay (but you didn\'t receive it). Take meter readings at check-in and check-out to establish their usage period.',
  },
  {
    question: 'What if the tenant left and I can\'t trace them?',
    answer:
      'You can still make a court claim - the court can serve papers to their last known address or, if you find their new address, there. If they don\'t respond to the claim, you can get default judgment. Enforcement is the challenge if they have no assets.',
  },
  {
    question: 'Should I switch utilities back to my name between tenants?',
    answer:
      'Many landlords keep utilities in their name to avoid supply issues and standing charge disputes between tenancies. Just ensure your tenancy agreement clearly states the tenant reimburses you for usage during their tenancy.',
  },
];

export default function MoneyClaimUnpaidUtilitiesPage() {
  return (
    <>
      <StructuredData
        data={articleSchema({
          headline: 'Claim Unpaid Utilities from Tenant (UK Landlord Guide)',
          description:
            'Complete guide for landlords to recover unpaid gas, electricity, water, and other utility bills from tenants through the courts.',
          url: getCanonicalUrl('/money-claim-unpaid-utilities'),
          datePublished: '2026-01-01',
          dateModified: '2026-01-01',
        })}
      />
      <StructuredData
        data={breadcrumbSchema([
          { name: 'Home', url: 'https://landlordheaven.co.uk' },
          { name: 'Claim Unpaid Utilities', url: 'https://landlordheaven.co.uk/money-claim-unpaid-utilities' },
        ])}
      />

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-blue-700/50 text-blue-100 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                Recover unpaid bills
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Claim Unpaid Utilities from Tenant
              </h1>

              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                When tenants leave unpaid gas, electricity, water, or other bills in your
                name, recover your costs through the courts.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/wizard?product=money_claim&reason=unpaid_utilities&src=seo_utilities"
                  className="inline-flex items-center justify-center gap-2 bg-white text-blue-800 font-semibold py-4 px-8 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  Start Utilities Claim
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

        {/* Understanding Liability Section */}
        <section className="py-12 lg:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Understanding Utility Liability
              </h2>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-8 rounded-r-lg">
                <p className="text-amber-900 text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Key question:</strong> Whose name are the utilities in? If
                    accounts are in the tenant&apos;s name, the debt is theirs directly with
                    the supplier. If in your name as landlord, you&apos;re liable to the
                    supplier but can claim reimbursement from the tenant.
                  </span>
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Utilities in YOUR Name
                  </h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• You&apos;re liable to pay the supplier</li>
                    <li>• Tenancy agreement should require tenant reimbursement</li>
                    <li>• Take meter readings at check-in/check-out</li>
                    <li>• Can claim unpaid amounts from tenant</li>
                    <li>• Can use deposit for utility arrears</li>
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    Utilities in TENANT&apos;S Name
                  </h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Tenant is directly liable to supplier</li>
                    <li>• Debt is between tenant and utility company</li>
                    <li>• You generally can&apos;t claim their bills</li>
                    <li>• Exception: if you&apos;ve suffered loss due to breach</li>
                    <li>• Utility company may contact you anyway</li>
                  </ul>
                </div>
              </div>

              {/* Utility types */}
              <div className="grid md:grid-cols-4 gap-4 mb-8">
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200 text-center">
                  <Flame className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <h4 className="font-bold text-gray-900 text-sm">Gas</h4>
                  <p className="text-xs text-gray-600 mt-1">Account holder liable</p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200 text-center">
                  <Zap className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <h4 className="font-bold text-gray-900 text-sm">Electricity</h4>
                  <p className="text-xs text-gray-600 mt-1">Account holder liable</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 text-center">
                  <Droplets className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-bold text-gray-900 text-sm">Water</h4>
                  <p className="text-xs text-gray-600 mt-1">Landlord often liable*</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200 text-center">
                  <Wifi className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-bold text-gray-900 text-sm">Broadband</h4>
                  <p className="text-xs text-gray-600 mt-1">Contract holder liable</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
                <h4 className="font-bold text-blue-900 mb-2">* Water Company Rules</h4>
                <p className="text-blue-800 text-sm">
                  Water companies can pursue landlords for unpaid bills even if the tenant
                  was named on the account. This is different from gas and electricity.
                  However, you can still claim these amounts back from the tenant if your
                  tenancy agreement made them responsible.
                </p>
              </div>

              {/* Ask Heaven callout */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">☁️</span>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">
                      Confused about utility liability?
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      Use our free{' '}
                      <Link href="/ask-heaven" className="text-primary font-medium hover:underline">
                        Ask Heaven landlord Q&amp;A tool
                      </Link>{' '}
                      to get instant guidance on who&apos;s responsible for unpaid bills.
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
                Evidence You Need for Utility Claims
              </h2>

              <p className="text-gray-600 mb-8">
                To claim unpaid utilities, you need to prove: the tenant was responsible
                for payment, the amounts owed, and that they haven&apos;t paid.
              </p>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-blue-600" />
                  Essential Evidence Checklist
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Tenancy agreement (utility clause)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Meter readings at check-in
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Meter readings at check-out
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Utility bills for tenancy period
                    </li>
                  </ul>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Proof bills are unpaid (statements)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Your payment records (if you paid)
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Correspondence with tenant about bills
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Letter before action sent
                    </li>
                  </ul>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3">Gas & Electric</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Final bills showing amounts owed</li>
                    <li>• Meter readings proving usage period</li>
                    <li>• Payment history from supplier</li>
                    <li>• Account statements</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3">Water & Sewerage</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Water company bills</li>
                    <li>• Proof you&apos;ve paid (if applicable)</li>
                    <li>• Account correspondence</li>
                    <li>• Tenancy agreement clause</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3">Broadband/Phone</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Service contract in your name</li>
                    <li>• Bills showing unpaid periods</li>
                    <li>• Tenancy clause on responsibility</li>
                    <li>• Your payment records</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How to Claim Section */}
        <section className="py-12 lg:py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                How to Make a Utility Bills Claim
              </h2>

              <div className="space-y-4 mb-8">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Calculate What&apos;s Owed</h3>
                      <p className="text-gray-600 text-sm">
                        Use meter readings to establish usage during the tenancy. Get final
                        bills from each supplier showing exactly what&apos;s unpaid. Create an
                        itemised schedule by utility type.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Check Deposit Options</h3>
                      <p className="text-gray-600 text-sm">
                        If you hold a deposit, you can deduct utility arrears from it. Use
                        the deposit scheme&apos;s dispute resolution if the tenant disagrees.
                        Only court claim amounts exceeding the deposit.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Send Letter Before Action</h3>
                      <p className="text-gray-600 text-sm">
                        Write to the tenant with an itemised breakdown of unpaid utilities,
                        copies of bills, and a deadline to pay (14-30 days). This is required
                        before court proceedings.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      4
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Make Your Court Claim</h3>
                      <p className="text-gray-600 text-sm">
                        If the tenant doesn&apos;t pay, submit your claim via MCOL (England & Wales)
                        or Simple Procedure (Scotland). Include tenancy agreement, utility
                        bills, meter readings, and your letter before action.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      5
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Add Statutory Interest</h3>
                      <p className="text-gray-600 text-sm">
                        You can claim 8% statutory interest on the unpaid amounts from the
                        date each bill was due. This accumulates until payment and is added
                        to your total claim.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="font-bold text-gray-900 mb-3">Ready to Claim Unpaid Utilities?</h4>
                <p className="text-gray-600 text-sm mb-4">
                  Our Money Claim Pack includes letter before action templates, schedule of
                  debt builder, court form guidance, and step-by-step instructions for utility claims.
                </p>
                <Link
                  href="/wizard?product=money_claim&reason=unpaid_utilities&src=seo_utilities"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  <FileText className="w-4 h-4" />
                  Start Utilities Claim
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Common Scenarios Section */}
        <section className="py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Common Utility Claim Scenarios
              </h2>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <PoundSterling className="w-5 h-5 text-blue-600" />
                    Scenario 1: Bills in Your Name, Tenant Didn&apos;t Reimburse
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    You pay utilities and the tenant reimburses you (common setup). The
                    tenant stopped paying during the tenancy or at the end.
                  </p>
                  <p className="text-gray-700 text-sm font-medium">
                    <CheckCircle className="w-4 h-4 inline text-green-500 mr-1" />
                    Can claim: Yes - the unpaid reimbursement is a debt owed to you under the
                    tenancy agreement.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <PoundSterling className="w-5 h-5 text-blue-600" />
                    Scenario 2: Utilities Included in Rent
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Rent is stated as &quot;£X including bills&quot;. The tenant paid less than
                    expected rent, or you want to claim the utility portion specifically.
                  </p>
                  <p className="text-gray-700 text-sm font-medium">
                    <CheckCircle className="w-4 h-4 inline text-green-500 mr-1" />
                    Can claim: Claim as unpaid rent. You don&apos;t need to separate the
                    utility portion - it&apos;s all rent arrears.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <PoundSterling className="w-5 h-5 text-blue-600" />
                    Scenario 3: Water Company Chasing You
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    The water company is pursuing you for unpaid bills even though the tenant
                    was supposed to pay. You&apos;ve had to pay to avoid debt action.
                  </p>
                  <p className="text-gray-700 text-sm font-medium">
                    <CheckCircle className="w-4 h-4 inline text-green-500 mr-1" />
                    Can claim: Yes - claim reimbursement for what you&apos;ve paid on their
                    behalf. Keep receipts of your payments.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    Scenario 4: Bills in Tenant&apos;s Name, Not Paid
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Utilities were transferred to the tenant&apos;s name. They&apos;ve left
                    without paying. The energy company contacts you.
                  </p>
                  <p className="text-gray-700 text-sm font-medium">
                    <AlertTriangle className="w-4 h-4 inline text-amber-500 mr-1" />
                    Generally no claim: The debt is between tenant and supplier. You&apos;re
                    not liable (except water). Direct the supplier to the tenant.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-blue-700 to-blue-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">
                Ready to Recover Unpaid Utility Costs?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Our Money Claim Pack walks you through calculating what&apos;s owed, gathering
                evidence, sending the letter before action, and making your court claim.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/wizard?product=money_claim&reason=unpaid_utilities&src=seo_utilities"
                  className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 font-semibold py-4 px-8 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  Start Utilities Claim
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/products/money-claim"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-xl transition-colors border border-white/30"
                >
                  <FileText className="w-5 h-5" />
                  View Full Pack Details
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <NextLegalSteps
                jurisdictionLabel="UK utility claims"
                scenarioLabel="recovering unpaid utility costs from tenants"
                primaryCTA={{
                  label: 'Start utilities claim',
                  href: '/wizard?product=money_claim&reason=unpaid_utilities&src=seo_utilities',
                }}
                secondaryCTA={{
                  label: 'View Money Claim Pack',
                  href: productLinks.moneyClaim.href,
                }}
                relatedLinks={[
                  {
                    href: '/money-claim-unpaid-rent',
                    title: 'Claim unpaid rent',
                    description: 'Recover rent arrears through the courts.',
                  },
                  {
                    href: '/money-claim-property-damage',
                    title: 'Claim property damage',
                    description: 'Recover repair costs for tenant damage.',
                  },
                  {
                    href: toolLinks.rentArrearsCalculator.href,
                    title: toolLinks.rentArrearsCalculator.title,
                    description: 'Calculate total owed including interest.',
                  },
                  {
                    href: '/ask-heaven',
                    title: 'Ask Heaven',
                    description: 'Get instant answers to landlord legal questions.',
                  },
                ]}
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          title="Unpaid Utilities: Frequently Asked Questions"
          faqs={faqs}
          showContactCTA={false}
          variant="white"
        />
      </main>
    </>
  );
}
