import { Metadata } from 'next';
import { getCanonicalUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'HMO Licence Checker UK | Check If Your Property Needs a Licence',
  description:
    'Free HMO licence checker for UK landlords. Enter your property details to instantly check if you need mandatory or additional HMO licensing. Covers England, Wales & Scotland.',
  keywords: [
    'HMO licence checker',
    'HMO licensing UK',
    'do I need HMO licence',
    'mandatory HMO licence',
    'additional licensing check',
    'house in multiple occupation',
    'HMO requirements',
  ],
  openGraph: {
    title: 'HMO Licence Checker UK | Landlord Heaven',
    description:
      'Instantly check if your property needs an HMO licence. Free tool for UK landlords.',
    type: 'website',
    url: getCanonicalUrl('/tools/hmo-license-checker'),
  },
  alternates: {
    canonical: getCanonicalUrl('/tools/hmo-license-checker'),
  },
};

export default function HMOLicenseCheckerLayout({
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
            name: 'How to Check if You Need an HMO License',
            description:
              'Determine if your rental property requires HMO (House in Multiple Occupation) licensing in the UK',
            estimatedCost: {
              '@type': 'MonetaryAmount',
              currency: 'GBP',
              value: '0',
            },
            step: [
              {
                '@type': 'HowToStep',
                name: 'Enter property postcode',
                text: 'Provide the postcode of your rental property to check local requirements',
              },
              {
                '@type': 'HowToStep',
                name: 'Provide occupancy details',
                text: 'Enter the number of occupants and households in the property',
              },
              {
                '@type': 'HowToStep',
                name: 'Specify property type',
                text: 'Select whether the property is a house, flat, converted building, or purpose-built',
              },
              {
                '@type': 'HowToStep',
                name: 'Confirm shared facilities',
                text: 'Indicate if tenants share kitchen or bathroom facilities',
              },
              {
                '@type': 'HowToStep',
                name: 'Review likelihood assessment',
                text: 'Get instant assessment of whether HMO licensing is likely required',
              },
              {
                '@type': 'HowToStep',
                name: 'Check with local council',
                text: 'Contact your local council to confirm specific licensing requirements',
              },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
