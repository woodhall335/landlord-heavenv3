import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Tenancy Agreements | England & Wales',
  description: 'Choose England (AST) or Wales (Occupation Contract). Create a legally compliant tenancy agreement for your jurisdiction.',
  robots: 'noindex, follow', // Don't index this disambiguation page
};

export default function EnglandWalesRedirectPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 pt-20">
      {/* Breadcrumb Navigation */}
      <div className="container mx-auto px-4 py-4">
        <nav className="text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/tenancy-agreements" className="hover:text-blue-600">Tenancy Agreements</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Choose Jurisdiction</span>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Choose Your Jurisdiction
          </h1>
          <p className="text-xl text-gray-700 mb-12">
            England and Wales now have different tenancy laws. Please select your property location to create the correct legal agreement.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* England Card */}
            <Link
              href="/tenancy-agreements/england"
              className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-blue-600 hover:shadow-xl transition-all hover:scale-105 block"
            >
              <div className="text-6xl mb-4">🏴󠁧󠁢󠁥󠁮󠁧󠁿</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">England</h2>
              <p className="text-gray-600 mb-4">
                Assured Shorthold Tenancy (AST) under the Housing Act 1988
              </p>
              <div className="text-blue-600 font-semibold">
                Create AST Agreement →
              </div>
            </Link>

            {/* Wales Card */}
            <Link
              href="/tenancy-agreements/wales"
              className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-red-600 hover:shadow-xl transition-all hover:scale-105 block"
            >
              <div className="text-6xl mb-4">🏴󠁧󠁢󠁷󠁬󠁳󠁿</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Wales</h2>
              <p className="text-gray-600 mb-4">
                Occupation Contract under the Renting Homes (Wales) Act 2016
              </p>
              <div className="text-red-600 font-semibold">
                Create Occupation Contract →
              </div>
            </Link>
          </div>

          <div className="mt-12 bg-amber-50 border border-amber-200 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="font-semibold text-amber-900 mb-2">Why are they different?</h3>
            <p className="text-gray-700 text-sm">
              Since December 2022, Wales has its own tenancy law under the <strong>Renting Homes (Wales) Act 2016</strong>.
              Properties in Wales use &quot;Occupation Contracts&quot; instead of ASTs, with different notice periods,
              tenant rights, and legal requirements. Using the correct agreement for your jurisdiction is essential
              for legal compliance.
            </p>
          </div>
        </div>
      </section>

      {/* SEO Internal Links */}
      <section className="container mx-auto px-4 py-8 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Other UK Jurisdictions</h3>
          <div className="flex gap-6 flex-wrap">
            <Link href="/tenancy-agreements/scotland" className="text-blue-600 hover:underline font-semibold">
              Scotland Private Residential Tenancy (PRT) →
            </Link>
            <Link href="/tenancy-agreements/northern-ireland" className="text-blue-600 hover:underline font-semibold">
              Northern Ireland Private Tenancy →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
