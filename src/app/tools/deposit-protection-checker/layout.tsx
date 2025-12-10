import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Deposit Protection Checker | Section 21 Validity | Landlord Heaven',
  description:
    'Check if your deposit protection is compliant. Free tool for UK landlords. Verify Section 21 validity instantly and avoid costly penalties.',
  keywords: [
    'deposit protection checker',
    'section 21 validity',
    'deposit compliance',
    'prescribed information',
    'tenancy deposit scheme',
    'dps checker',
    'mydeposits',
    'tds',
    'how to rent guide',
  ],
  openGraph: {
    title: 'Free Deposit Protection Checker | Landlord Heaven',
    description:
      'Check deposit protection compliance and Section 21 validity. Free instant assessment for UK landlords.',
    type: 'website',
  },
};

export default function DepositProtectionCheckerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Schema.org JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'How to Check Deposit Protection Compliance',
            description:
              'Verify your tenancy deposit is properly protected and check Section 21 validity for UK landlords',
            estimatedCost: {
              '@type': 'MonetaryAmount',
              currency: 'GBP',
              value: '0',
            },
            step: [
              {
                '@type': 'HowToStep',
                name: 'Enter deposit details',
                text: 'Provide the deposit amount and protection scheme information',
              },
              {
                '@type': 'HowToStep',
                name: 'Confirm protection date',
                text: 'Enter the date when the deposit was protected (must be within 30 days of receipt)',
              },
              {
                '@type': 'HowToStep',
                name: 'Verify prescribed information',
                text: 'Confirm whether prescribed information was provided to the tenant',
              },
              {
                '@type': 'HowToStep',
                name: 'Check How to Rent guide',
                text: 'Verify if the How to Rent guide was provided (England only)',
              },
              {
                '@type': 'HowToStep',
                name: 'Review compliance status',
                text: 'Get instant assessment of your deposit protection compliance and Section 21 validity',
              },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
