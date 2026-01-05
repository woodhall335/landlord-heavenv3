import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Rent Arrears Calculator',
  description:
    'Calculate rent arrears and 8% statutory interest for UK landlords. Free arrears schedule generator with PDF download. Court-ready money claim upgrade available.',
  keywords: [
    'rent arrears calculator',
    'rent arrears interest',
    'landlord arrears calculator',
    'statutory interest calculator',
    'rent arrears schedule',
    'money claim calculator',
    'landlord tools UK',
  ],
  openGraph: {
    title: 'Free Rent Arrears Calculator | Landlord Heaven',
    description:
      'Calculate rent arrears and statutory interest. Free PDF schedule for UK landlords.',
    type: 'website',
  },
};

export default function RentArrearsCalculatorLayout({
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
            name: 'How to Calculate Rent Arrears and Interest',
            description:
              'Calculate outstanding rent arrears and statutory interest at 8% per annum for UK landlords',
            estimatedCost: {
              '@type': 'MonetaryAmount',
              currency: 'GBP',
              value: '0',
            },
            step: [
              {
                '@type': 'HowToStep',
                name: 'Enter rent amount',
                text: 'Specify the monthly or weekly rent amount for the tenancy',
              },
              {
                '@type': 'HowToStep',
                name: 'Add payment periods',
                text: 'Enter each rent period with due date, amount due, and any payments received',
              },
              {
                '@type': 'HowToStep',
                name: 'Review arrears summary',
                text: 'See total rent due, payments received, and outstanding arrears balance',
              },
              {
                '@type': 'HowToStep',
                name: 'Calculate statutory interest',
                text: 'View the 8% per annum interest calculated on outstanding balances',
              },
              {
                '@type': 'HowToStep',
                name: 'Download PDF schedule',
                text: 'Generate and download a professional arrears schedule for court proceedings',
              },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
