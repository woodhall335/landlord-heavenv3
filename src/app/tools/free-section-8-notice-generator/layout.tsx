import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Section 8 Notice Generator | Landlord Heaven',
  description:
    'Generate a free Section 8 notice with grounds for possession. Court-ready version with ground-specific validation for £14.99. Free landlord tool.',
  keywords: [
    'free section 8 notice generator',
    'section 8 template',
    'section 8 grounds',
    'eviction notice grounds',
    'landlord tools UK',
    'free section 8 form',
  ],
};

export default function FreeSection8Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Schema.org JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: 'How to Generate a Section 8 Notice',
            description:
              'Generate a Section 8 notice with grounds for possession to evict a tenant in England & Wales',
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
                text: "Provide the tenant's full legal name",
              },
              {
                '@type': 'HowToStep',
                name: 'Enter property address',
                text: 'Provide the complete address of the rental property including postcode',
              },
              {
                '@type': 'HowToStep',
                name: 'Select eviction grounds',
                text: 'Choose the grounds for possession (e.g., rent arrears, breach of tenancy, antisocial behaviour)',
              },
              {
                '@type': 'HowToStep',
                name: 'Provide ground details',
                text: 'Enter specific details supporting each ground (arrears amount, breach description, etc.)',
              },
              {
                '@type': 'HowToStep',
                name: 'Generate notice',
                text: 'Click to generate your Section 8 notice with all grounds listed',
              },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
