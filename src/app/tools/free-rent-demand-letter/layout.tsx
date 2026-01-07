import { Metadata } from 'next';
import { getCanonicalUrl } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Free Rent Demand Letter Generator',
  description:
    'Generate a free rent demand letter template for UK landlords. Professional arrears demand letters for unpaid rent with formal legal warning.',
  keywords: [
    'rent demand letter uk',
    'arrears demand letter',
    'formal rent demand',
    'landlord letter template',
    'rent arrears letter',
    'demand for rent payment',
    'rent recovery letter',
    'section 8 preparation',
  ],
  openGraph: {
    title: 'Free Rent Demand Letter Generator | Landlord Heaven',
    description:
      'Generate professional rent demand letters for unpaid rent. Free template for UK landlords.',
    type: 'website',
    url: getCanonicalUrl('/tools/free-rent-demand-letter'),
  },
  alternates: {
    canonical: getCanonicalUrl('/tools/free-rent-demand-letter'),
  },
};

export default function RentDemandLetterLayout({
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
            name: 'How to Write a Rent Demand Letter',
            description:
              'Create a formal demand letter for unpaid rent arrears for UK landlords',
            estimatedCost: {
              '@type': 'MonetaryAmount',
              currency: 'GBP',
              value: '0',
            },
            step: [
              {
                '@type': 'HowToStep',
                name: 'Enter landlord details',
                text: 'Provide your name and address as the landlord',
              },
              {
                '@type': 'HowToStep',
                name: 'Enter tenant details',
                text: 'Provide the tenant\'s name and property address',
              },
              {
                '@type': 'HowToStep',
                name: 'Specify arrears amount',
                text: 'Enter the total amount owed and rental period covered',
              },
              {
                '@type': 'HowToStep',
                name: 'Set payment deadline',
                text: 'Specify the date by which payment must be received (typically 14 days)',
              },
              {
                '@type': 'HowToStep',
                name: 'Generate letter',
                text: 'Create your professional rent demand letter',
              },
              {
                '@type': 'HowToStep',
                name: 'Serve the letter',
                text: 'Send by first class post or recorded delivery and keep proof',
              },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
