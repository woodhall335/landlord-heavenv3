import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { getCanonicalUrl } from '@/lib/seo';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { FAQSection } from '@/components/seo/FAQSection';
import { mcolFAQs } from '@/data/faqs';
import { HeaderConfig } from '@/components/layout/HeaderConfig';
import { UniversalHero } from '@/components/landing/UniversalHero';
import { buildWizardLink } from '@/lib/wizard/buildWizardLink';

const moneyClaimWizardLink = buildWizardLink({
  product: 'money_claim',
  jurisdiction: 'england',
  src: 'seo_mcol_money_claim_online',
  topic: 'debt',
});

export const metadata: Metadata = {
  title: 'MCOL Money Claim Online | Solicitor-Style Landlord Guide',
  description:
    'Guide to MCOL (Money Claim Online) for UK landlords. Recover rent arrears through the county court. Step-by-step process.',
  keywords: [
    'MCOL',
    'money claim online',
    'MCOL landlord',
    'money claim rent arrears',
    'county court claim',
    'recover rent arrears',
    'small claims court landlord',
  ],
  openGraph: {
    title: 'MCOL Money Claim Online | Solicitor-Style Landlord Guide',
    description:
      'How to use Money Claim Online (MCOL) to recover rent arrears from a tenant.',
    type: 'article',
    url: getCanonicalUrl('/mcol-money-claim-online'),
  },
  alternates: {
    canonical: getCanonicalUrl('/mcol-money-claim-online'),
  },
};

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'MCOL Money Claim Online', url: '/mcol-money-claim-online' },
];

export default function MCOLPage() {
  return (
    <>
      <HeaderConfig mode="autoOnScroll" />
      <StructuredData data={breadcrumbSchema(breadcrumbs)} />

      <div className="min-h-screen bg-gray-50">
        <UniversalHero
          badge="Debt Recovery"
          title="MCOL: Money Claim Online for Landlords"
          subtitle="MCOL (Money Claim Online) is the government system for claiming debts through the county court. Use it to recover rent arrears, damages, or unpaid bills from tenants."
          primaryCta={{ label: 'Start Money Claim Wizard', href: moneyClaimWizardLink }}
          secondaryCta={{ label: 'Calculate Arrears', href: '/tools/rent-arrears-calculator' }}
          variant="pastel"
        />

        {/* Main Content */}
        <Container>
          <div className="max-w-4xl mx-auto py-12">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm mb-12">
              <div className="prose prose-slate max-w-none">
                <h2>What is Money Claim Online (MCOL)?</h2>
                <p>
                  MCOL is the government&apos;s online portal for making county court claims for money
                  in England and Wales. It&apos;s quicker and cheaper than paper claims, and you can
                  track your claim&apos;s progress online.
                </p>
                <p>
                  For landlords, MCOL is the primary way to recover:
                </p>
                <ul>
                  <li>Unpaid rent (arrears)</li>
                  <li>Damages beyond normal wear and tear</li>
                  <li>Unpaid utility bills</li>
                  <li>Cleaning costs</li>
                  <li>Other money owed under the tenancy agreement</li>
                </ul>

                <h2>Before You Start: Pre-Action Protocol</h2>
                <p>
                  The <Link href="/pre-action-protocol-debt" className="text-primary hover:underline">Pre-Action Protocol for Debt Claims</Link> is mandatory. You must:
                </p>
                <ol>
                  <li>
                    <strong>Send a Letter Before Claim:</strong> A formal letter giving the debtor
                    information about the debt and at least 30 days to respond
                  </li>
                  <li>
                    <strong>Include a Reply Form:</strong> Allowing the debtor to request more
                    information, propose a payment plan, or dispute the debt
                  </li>
                  <li>
                    <strong>Consider their response:</strong> If they propose reasonable payments,
                    you should accept rather than proceeding to court
                  </li>
                  <li>
                    <strong>Wait 30 days:</strong> Before starting court proceedings
                  </li>
                </ol>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-6">
                  <p className="text-amber-800 font-semibold mb-2">Warning</p>
                  <p className="text-amber-700 text-sm">
                    Failure to follow the Pre-Action Protocol can result in the court awarding costs
                    against you, even if you win your case. Always send the Letter Before Claim first.
                  </p>
                </div>

                <h2>The MCOL Process</h2>
                <ol>
                  <li>
                    <strong>Register on gov.uk:</strong> Create an account on the Money Claim Online
                    system
                  </li>
                  <li>
                    <strong>Enter claim details:</strong> Defendant&apos;s name/address, amount claimed,
                    and particulars of claim
                  </li>
                  <li>
                    <strong>Pay the court fee:</strong> Fees vary based on claim amount (see FAQ
                    below)
                  </li>
                  <li>
                    <strong>Court serves the claim:</strong> The defendant has 14 days to respond
                  </li>
                  <li>
                    <strong>Defendant responds (or doesn&apos;t):</strong>
                    <ul>
                      <li>Admits the claim: You can request judgment</li>
                      <li>Disputes the claim: May go to hearing</li>
                      <li>No response: Request default judgment</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Judgment:</strong> If successful, you get a County Court Judgment (CCJ)
                  </li>
                  <li>
                    <strong>Enforcement:</strong> If they don&apos;t pay, use bailiffs, attachment of
                    earnings, or charging orders
                  </li>
                </ol>

                <h2>What Can You Claim?</h2>
                <ul>
                  <li>
                    <strong>Principal debt:</strong> The amount owed (rent arrears, damages, etc.)
                  </li>
                  <li>
                    <strong>Statutory interest:</strong> 8% per year on unpaid amounts
                  </li>
                  <li>
                    <strong>Court fees:</strong> Added to the claim amount
                  </li>
                </ul>

                <h2>MCOL Limits</h2>
                <p>MCOL can be used for claims:</p>
                <ul>
                  <li>Up to £100,000</li>
                  <li>Against defendants with addresses in England or Wales</li>
                  <li>With a fixed amount (not unquantified damages)</li>
                </ul>
                <p>
                  For claims over £10,000, consider whether the small claims track (simpler, no legal
                  costs recovery) or fast track/multi-track (more formal, potential costs recovery) is
                  appropriate.
                </p>

                <h2>After Getting a Judgment</h2>
                <p>
                  A County Court Judgment (CCJ) is a court order confirming the debt. If the debtor
                  still doesn&apos;t pay, you can enforce it using:
                </p>
                <ul>
                  <li>
                    <strong>High Court Enforcement:</strong> For debts over £600, transfer to High
                    Court and use enforcement officers
                  </li>
                  <li>
                    <strong>County Court Bailiffs:</strong> For smaller debts
                  </li>
                  <li>
                    <strong>Attachment of Earnings:</strong> Money taken directly from their wages
                  </li>
                  <li>
                    <strong>Charging Order:</strong> Secured against their property (if they own one)
                  </li>
                </ul>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mb-12">
              <FAQSection
                faqs={mcolFAQs}
                title="MCOL Frequently Asked Questions"
                showContactCTA={false}
                variant="white"
              />
            </div>

            {/* CTA */}
            <div className="p-8 bg-purple-50 rounded-2xl text-center">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                Ready to Recover Your Money?
              </h2>
              <p className="text-gray-600 mb-6">
                Our Money Claim Pack includes pre-action letters, arrears schedule, and claim form
                guidance.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/products/money-claim" className="hero-btn-primary">
                  Get Money Claim Pack
                </Link>
                <Link href="/tools/rent-arrears-calculator" className="hero-btn-secondary">
                  Calculate Arrears First
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
