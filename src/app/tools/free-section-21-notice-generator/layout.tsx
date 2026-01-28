import { Metadata } from 'next';
import { getCanonicalUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Free Section 21 Notice Generator | Create Form 6A Online',
  description:
    'Generate a free Section 21 notice (Form 6A) for England. Our generator creates a valid no-fault eviction notice with correct notice periods. Download as PDF instantly.',
  keywords: [
    'free section 21 notice generator',
    'section 21 generator',
    'form 6a generator',
    'create section 21 notice',
    'section 21 notice free',
    'eviction notice generator',
    'no fault eviction notice',
  ],
  openGraph: {
    title: 'Free Section 21 Notice Generator | Landlord Heaven',
    description:
      'Create a valid Section 21 notice (Form 6A) in minutes. Free generator for England landlords.',
    type: 'website',
    url: getCanonicalUrl('/tools/free-section-21-notice-generator'),
  },
  alternates: {
    canonical: getCanonicalUrl('/tools/free-section-21-notice-generator'),
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
              'Generate a Section 21 notice template for ending an assured shorthold tenancy in England',
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
