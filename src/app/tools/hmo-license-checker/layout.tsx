import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free HMO License Checker | Do I Need an HMO License? | Landlord Heaven',
  description:
    'Check if your rental property needs HMO licensing. Free HMO checker for UK landlords. Get instant assessment and guidance on HMO requirements.',
  keywords: [
    'hmo license checker',
    'hmo licensing uk',
    'house in multiple occupation',
    'hmo rules',
    'do i need hmo license',
    'hmo checker',
    'hmo requirements',
    'mandatory hmo licensing',
  ],
  openGraph: {
    title: 'Free HMO License Checker | Landlord Heaven',
    description:
      'Check if your property needs HMO licensing. Free instant assessment tool for UK landlords.',
    type: 'website',
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
