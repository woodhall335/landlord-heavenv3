import { Metadata } from 'next';
import { getCanonicalUrl } from '@/lib/seo';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://landlordheaven.co.uk';

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

const howToSchema = {
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
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How should I evidence rent arrears for court?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Prepare a clear rent schedule showing all payments due and received, with a running balance. Attach your tenancy agreement, bank statements highlighting missed payments, and copies of all communications with the tenant about the arrears. The court wants to see you\'ve made reasonable attempts to resolve the issue before litigation.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I claim interest on rent arrears?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. You can claim statutory interest at 8% per annum under the Late Payment of Commercial Debts (Interest) Act 1998. Interest runs from each payment\'s due date until it\'s paid or judgment is entered. You must state your intention to claim interest in your pre-action letter. Some tenancy agreements include contractual interest clauses—check yours carefully.',
      },
    },
    {
      '@type': 'Question',
      name: 'What if my tenant disputes the arrears amount?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Request a detailed breakdown from the tenant showing which payments they believe they\'ve made. Check your records carefully—mistakes happen. If there\'s a genuine dispute, consider mediation before court. If the tenant simply refuses to pay without valid reason, proceed with your money claim and let the court decide. Keep all communication professional and documented.',
      },
    },
    {
      '@type': 'Question',
      name: 'Should I serve a Section 8 notice or file a money claim?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'It depends on your goal. A Section 8 notice (Ground 8 requires 8+ weeks arrears) seeks possession of the property. A money claim pursues the debt even after the tenant has left. Many landlords do both: serve a Section 8 to regain possession, then file a money claim for any remaining debt.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is this calculator\'s 8% interest calculation legally accurate?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'This calculator uses the standard statutory rate of 8% per annum as simple interest. While widely accepted, actual court awards may vary based on jurisdiction, the judge\'s discretion, and your specific tenancy agreement. For a court-ready arrears schedule with jurisdiction-specific calculations and full legal validation, upgrade to our Money Claim Pack.',
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
      name: 'Rent Arrears Calculator',
      item: `${SITE_URL}/tools/rent-arrears-calculator`,
    },
  ],
};

export default function RentArrearsCalculatorLayout({
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
