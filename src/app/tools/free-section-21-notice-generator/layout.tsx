import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Section 21 Notice Generator',
  description:
    'Generate a free Section 21 notice template for England & Wales. Get a court-ready version with legal validation for £14.99. Free landlord tool.',
  keywords: [
    'free section 21 notice generator',
    'section 21 template',
    'eviction notice UK',
    'section 21 form',
    'landlord tools',
    'free eviction notice',
    'section 21 notice England Wales',
  ],
  openGraph: {
    title: 'Free Section 21 Notice Generator | Landlord Heaven',
    description:
      'Generate a free Section 21 notice template. Upgrade for court-ready version.',
    type: 'website',
  },
};

export default function FreeSection21Layout({
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
            name: 'How to Generate a Section 21 Notice',
            description:
              'Generate a Section 21 notice template for ending an assured shorthold tenancy in England & Wales',
            estimatedCost: {
              '@type': 'MonetaryAmount',
              currency: 'GBP',
              value: '0',
            },
            step: [
              {
                '@type': 'HowToStep',
                name: 'Enter landlord details',
                text: 'Provide your full legal name as it appears on the tenancy agreement',
              },
              {
                '@type': 'HowToStep',
                name: 'Enter tenant details',
                text: 'Provide the tenant\'s full legal name',
              },
              {
                '@type': 'HowToStep',
                name: 'Enter property address',
                text: 'Provide the complete address of the rental property including postcode',
              },
              {
                '@type': 'HowToStep',
                name: 'Set notice date',
                text: 'Choose the date you are serving the notice (must be at least 2 months before required possession)',
              },
              {
                '@type': 'HowToStep',
                name: 'Generate template',
                text: 'Click to generate your Section 21 notice template',
              },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
