import { Metadata } from 'next';
import { getCanonicalUrl } from '@/lib/seo';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://landlordheaven.co.uk';

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

const howToSchema = {
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
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I know if my property is an HMO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Your property is an HMO if at least 3 tenants live there, forming more than 1 household, and share toilet, bathroom, or kitchen facilities. Use this free checker as a starting point, then contact your local council for confirmation. They can tell you if your property meets the HMO definition and whether it needs a license.',
      },
    },
    {
      '@type': 'Question',
      name: 'What happens if I operate an unlicensed HMO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Operating an unlicensed HMO is a criminal offence. You can face unlimited fines (commonly £30,000+), rent repayment orders forcing you to repay up to 12 months' rent to your tenants, and you cannot serve Section 21 notices to end tenancies. You may also be prosecuted and end up with a criminal record.",
      },
    },
    {
      '@type': 'Question',
      name: 'How much does an HMO license cost?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "HMO license fees vary significantly by council, typically ranging from £500 to £1,500+ per property. The license usually lasts for 5 years. Contact your local council for exact fees. While this may seem expensive, it's far less than the penalties for operating without one.",
      },
    },
    {
      '@type': 'Question',
      name: 'Can I convert my property to an HMO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "In many areas, you'll need planning permission to convert a property into an HMO, especially if you're changing from a single-family dwelling (C3 use class) to an HMO (C4 or Sui Generis). Check with your local planning authority before converting. You'll also need to meet HMO property standards, which include requirements for room sizes, fire safety, and amenities.",
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need separate tenancy agreements for HMO tenants?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can use either individual agreements for each tenant or a single joint agreement for all tenants. Individual agreements give you more flexibility (tenants can move out independently) but require more administration. Joint agreements make all tenants jointly and severally liable for the rent, providing more security.',
      },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: SITE_URL,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Free Tools',
      item: `${SITE_URL}/tools`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'HMO License Checker',
      item: `${SITE_URL}/tools/hmo-license-checker`,
    },
  ],
};

export default function HMOLicenseCheckerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Schema.org JSON-LD for SEO - HowTo */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      {/* Schema.org JSON-LD for SEO - FAQ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Schema.org JSON-LD for SEO - Breadcrumb */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
