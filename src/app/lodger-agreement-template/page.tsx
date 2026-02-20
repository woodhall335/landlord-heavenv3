import { Metadata } from 'next';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { getCanonicalUrl } from '@/lib/seo';
import { StructuredData, breadcrumbSchema } from '@/lib/seo/structured-data';
import { FAQSection } from '@/components/seo/FAQSection';
import { lodgerAgreementFAQs } from '@/data/faqs';

export const metadata: Metadata = {
  title: 'Lodger Agreement Template UK (Live-In Landlords) | Free Template for Live-In Landlords',
  description:
    'Lodger agreement template UK for live-in landlords. Download a free template, understand lodger rights, and create terms for rent, notice, and house rules.',
  keywords: [
    'lodger agreement template',
    'lodger agreement UK',
    'lodger contract template',
    'live in landlord agreement',
    'lodger agreement free',
    'lodger licence agreement',
    'room rental agreement UK',
  ],
  openGraph: {
    title: 'Lodger Agreement Template UK (Live-In Landlords) | Landlord Heaven',
    description:
      'Free lodger agreement template for live-in landlords. Download or generate online.',
    type: 'article',
    url: getCanonicalUrl('/lodger-agreement-template'),
  },
  alternates: {
    canonical: getCanonicalUrl('/lodger-agreement-template'),
  },
};

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Lodger Agreement Template', url: '/lodger-agreement-template' },
];

export default function LodgerAgreementPage() {
  return (
    <>
      <StructuredData data={breadcrumbSchema(breadcrumbs)} />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 pt-28 pb-16 md:pt-32 md:pb-20">
          <Container>
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-block bg-primary/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <span className="text-sm font-semibold text-primary">Live-In Landlords</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Lodger Agreement Template UK (Live-In Landlords)
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Need a lodger agreement template UK landlords can use with confidence? If you live in the property, you normally need a lodger agreement rather than an AST. Start with the right legal structure, then customise rent, notice, and house rules.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/products/ast" className="hero-btn-primary">
                  Get Lodger Agreement
                </Link>
                <Link href="/products/ast" className="hero-btn-secondary">
                  Compare Standard vs Premium Pack
                </Link>
              </div>
            </div>
          </Container>
        </section>

        {/* Main Content */}
        <Container>
          <div className="max-w-4xl mx-auto py-12">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm mb-12">
              <div className="prose prose-slate max-w-none">
                <h2>Lodger vs Tenant: What&apos;s the Difference?</h2>
                <p>
                  The key difference is whether the landlord lives in the property:
                </p>
                <ul>
                  <li>
                    <strong>Lodger:</strong> The landlord lives in the property. The lodger shares
                    common areas (kitchen, bathroom) with the landlord. The lodger is an &quot;excluded
                    occupier&quot; with limited rights.
                  </li>
                  <li>
                    <strong>Tenant:</strong> The landlord doesn&apos;t live in the property. The tenant
                    has exclusive possession. The tenant has full assured shorthold tenancy (AST)
                    protections.
                  </li>
                </ul>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 my-6">
                  <p className="text-amber-800 font-semibold mb-2">Important</p>
                  <p className="text-amber-700 text-sm">
                    If you don&apos;t live in the property, you cannot use a lodger agreement. You must
                    use an Assured Shorthold Tenancy agreement instead. Using the wrong agreement
                    could give your occupant tenant rights.
                  </p>
                </div>

                <h2>What Should a Lodger Agreement Include?</h2>
                <p>A comprehensive lodger agreement should cover:</p>
                <ul>
                  <li>
                    <strong>Names and addresses:</strong> Both landlord and lodger details
                  </li>
                  <li>
                    <strong>Room details:</strong> Which room(s) the lodger can use exclusively
                  </li>
                  <li>
                    <strong>Shared areas:</strong> Kitchen, bathroom, living areas they can access
                  </li>
                  <li>
                    <strong>Rent amount and payment:</strong> How much, when, and how to pay
                  </li>
                  <li>
                    <strong>Deposit:</strong> Amount and terms (no protection required)
                  </li>
                  <li>
                    <strong>Notice period:</strong> How much notice either party must give
                  </li>
                  <li>
                    <strong>Services included:</strong> Bills, Wi-Fi, meals, laundry, etc.
                  </li>
                  <li>
                    <strong>House rules:</strong> Guests, smoking, pets, quiet hours, etc.
                  </li>
                </ul>

                <p className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  If you want a faster route from free template to signed paperwork, use our
                  <Link href="/products/ast" className="text-primary hover:underline"> tenancy agreement product pack</Link>
                  to generate and download your final document in one flow.
                </p>

                <h2>Rent a Room Scheme</h2>
                <p>
                  The government&apos;s Rent a Room scheme lets you earn up to <strong>£7,500 per year</strong>{' '}
                  tax-free from letting a furnished room in your main home. This applies whether you
                  have one lodger or several.
                </p>
                <p>Key points:</p>
                <ul>
                  <li>The room must be in your main home (not a second property)</li>
                  <li>The room must be furnished</li>
                  <li>If you earn over £7,500, you must declare it on your tax return</li>
                  <li>The scheme is automatic - you don&apos;t need to apply</li>
                </ul>

                <h2>Ending a Lodger Agreement</h2>
                <p>
                  Because lodgers are &quot;excluded occupiers,&quot; they have fewer rights than tenants:
                </p>
                <ul>
                  <li>You can give notice as agreed in the lodger agreement</li>
                  <li>There&apos;s no minimum statutory notice period</li>
                  <li>You don&apos;t need a court order to evict</li>
                  <li>You can change the locks after the notice expires (though courts prefer
                      reasonable notice)</li>
                </ul>
                <p>
                  However, always follow the notice period in your agreement and treat the lodger
                  fairly to avoid potential harassment claims.
                </p>

                <h2>Do I Need to Do Anything Else?</h2>
                <ul>
                  <li>
                    <strong>Right to Rent:</strong> Yes, you must check the lodger&apos;s immigration
                    status
                  </li>
                  <li>
                    <strong>Deposit protection:</strong> No, not required for lodgers
                  </li>
                  <li>
                    <strong>Gas safety certificate:</strong> Recommended but not legally required
                  </li>
                  <li>
                    <strong>EPC:</strong> Not required for lodgers
                  </li>
                  <li>
                    <strong>How to Rent guide:</strong> Not required for lodgers
                  </li>
                </ul>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mb-12">
              <FAQSection
                faqs={lodgerAgreementFAQs}
                title="Lodger Agreement FAQ"
                showContactCTA={false}
                variant="white"
              />
            </div>

            {/* CTA */}
            <div className="p-8 bg-purple-50 rounded-2xl text-center">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">
                Need a Lodger Agreement?
              </h2>
              <p className="text-gray-600 mb-6">
                Get a professionally drafted lodger agreement template.
              </p>
              <Link href="/products/ast" className="hero-btn-primary">
                Get Lodger Agreement
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}
