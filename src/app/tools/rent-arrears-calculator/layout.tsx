import { Metadata } from 'next';
import { getCanonicalUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Rent Arrears Calculator UK | Calculate What Your Tenant Owes',
  description:
    'Free rent arrears calculator for UK landlords. Calculate total arrears, statutory interest at 8%, and check if you meet Section 8 Ground 8 thresholds. Instant results.',
  keywords: [
    'rent arrears calculator',
    'rent arrears calculator UK',
    'calculate rent owed',
    'tenant debt calculator',
    'ground 8 calculator',
    'statutory interest calculator',
    'rent arrears schedule',
  ],
  openGraph: {
    title: 'Rent Arrears Calculator UK | Landlord Heaven',
    description:
      'Calculate exactly what your tenant owes including statutory interest. Free, instant results.',
    type: 'website',
    url: getCanonicalUrl('/tools/rent-arrears-calculator'),
  },
  alternates: {
    canonical: getCanonicalUrl('/tools/rent-arrears-calculator'),
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
