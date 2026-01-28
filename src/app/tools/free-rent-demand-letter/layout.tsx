import { Metadata } from 'next';
import { getCanonicalUrl } from '@/lib/seo';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://landlordheaven.co.uk';

export const metadata: Metadata = {
  title: 'Free Rent Demand Letter Template | Formal Arrears Letter Generator',
  description:
    'Generate a free rent demand letter for your tenant. Professional template that formally requests payment of rent arrears. Download as PDF or Word document.',
  keywords: [
    'rent demand letter template',
    'rent demand letter',
    'formal rent arrears letter',
    'tenant arrears letter',
    'rent demand template free',
    'landlord letter template',
    'rent recovery letter',
  ],
  openGraph: {
    title: 'Free Rent Demand Letter Template | Landlord Heaven',
    description:
      'Generate a professional rent demand letter in minutes. Free template for UK landlords.',
    type: 'website',
    url: getCanonicalUrl('/tools/free-rent-demand-letter'),
  },
  alternates: {
    canonical: getCanonicalUrl('/tools/free-rent-demand-letter'),
  },
};

const howToSchema = {
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
      text: "Provide your name and address as the landlord",
    },
    {
      '@type': 'HowToStep',
      name: 'Enter tenant details',
      text: "Provide the tenant's name and property address",
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
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is a rent demand letter legally required?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "A demand letter is not strictly legally required before serving a Section 8 notice, but it's strongly recommended. However, if you're planning to pursue a money claim through the courts, the Pre-Action Protocol for Debt Claims requires you to give the debtor (tenant) notice and an opportunity to pay before starting proceedings. Failing to follow the protocol can result in cost penalties.",
      },
    },
    {
      '@type': 'Question',
      name: 'How long should I give the tenant to pay?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "14 days is standard and reasonable for a rent demand letter. This gives the tenant time to arrange payment or contact you to discuss the situation. If you're following the Pre-Action Protocol for a money claim, you should give at least 30 days before starting court proceedings, but your initial demand can be 14 days.",
      },
    },
    {
      '@type': 'Question',
      name: 'What if the tenant ignores the demand letter?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "If the tenant doesn't respond or pay by the deadline, you have several options: (1) Serve a Section 8 notice seeking possession based on rent arrears grounds 8, 10, or 11. (2) Start a money claim through the courts to recover the debt (without seeking possession). (3) Continue to pursue payment informally while considering your options.",
      },
    },
    {
      '@type': 'Question',
      name: 'Can I charge interest on rent arrears?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Only if your tenancy agreement specifically includes a clause allowing you to charge interest on late rent payments. Check your AST carefully. Even if your agreement includes an interest clause, the rate must be reasonable (typically 3-5% above Bank of England base rate). If there's no interest clause in your tenancy agreement, you cannot charge interest unless and until you obtain a county court judgment (CCJ).",
      },
    },
    {
      '@type': 'Question',
      name: 'Should I send a demand letter before a Section 8 notice?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Yes, it's good practice to send a demand letter before serving a Section 8 notice. It gives the tenant a chance to pay and avoid eviction proceedings, shows the court you tried to resolve the matter reasonably, the tenant may have a genuine reason for non-payment and may be able to pay quickly once reminded, and it strengthens your case if you proceed to court. Many judges look favorably on landlords who've tried to work with tenants before legal action.",
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
      name: 'Rent Demand Letter Generator',
      item: `${SITE_URL}/tools/free-rent-demand-letter`,
    },
  ],
};

export default function RentDemandLetterLayout({
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
