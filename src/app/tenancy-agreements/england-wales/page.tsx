import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Tenancy Agreements | England & Wales',
  description:
    'Choose England (Residential Tenancy Agreement) or Wales (Occupation Contract). Use the correct tenancy wording for your jurisdiction.',
  robots: 'noindex, follow',
};

export default function EnglandWalesRedirectPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 pt-20">
      <div className="container mx-auto px-4 py-4">
        <nav className="text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/products/ast" className="hover:text-blue-600">
            Tenancy Agreements
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">Choose Jurisdiction</span>
        </nav>
      </div>

      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold text-gray-900">Choose Your Jurisdiction</h1>
          <p className="mb-12 text-xl text-gray-700">
            England and Wales now use different tenancy wording. Choose the correct jurisdiction so you start from the right legal framework.
          </p>

          <div className="mx-auto grid max-w-3xl gap-8 md:grid-cols-2">
            <Link
              href="/tenancy-agreement"
              className="block rounded-2xl border-t-4 border-blue-600 bg-white p-8 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            >
              <div className="mb-4 text-6xl">England</div>
              <h2 className="mb-3 text-2xl font-bold text-gray-900">England</h2>
              <p className="mb-4 text-gray-600">
                Residential Tenancy Agreement wording for the updated England product route
              </p>
              <div className="font-semibold text-blue-600">Start England agreement -&gt;</div>
            </Link>

            <Link
              href="/wales-tenancy-agreement-template"
              className="block rounded-2xl border-t-4 border-red-600 bg-white p-8 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            >
              <div className="mb-4 text-6xl">Wales</div>
              <h2 className="mb-3 text-2xl font-bold text-gray-900">Wales</h2>
              <p className="mb-4 text-gray-600">
                Occupation Contract under the Renting Homes (Wales) Act 2016
              </p>
              <div className="font-semibold text-red-600">Create Occupation Contract -&gt;</div>
            </Link>
          </div>

          <div className="mx-auto mt-12 max-w-2xl rounded-lg border border-amber-200 bg-amber-50 p-6">
            <h3 className="mb-2 font-semibold text-amber-900">Why are they different?</h3>
            <p className="text-sm text-gray-700">
              Wales has used Occupation Contracts since December 2022, while the live England Landlord Heaven route now uses updated Residential Tenancy Agreement wording. Selecting the right jurisdiction keeps the agreement language aligned to the property location.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8 border-t border-gray-200">
        <div className="mx-auto max-w-4xl">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">Other UK Jurisdictions</h3>
          <div className="flex flex-wrap gap-6">
            <Link
              href="/private-residential-tenancy-agreement-template"
              className="font-semibold text-blue-600 hover:underline"
            >
              Scotland Private Residential Tenancy (PRT) -&gt;
            </Link>
            <Link
              href="/northern-ireland-tenancy-agreement-template"
              className="font-semibold text-blue-600 hover:underline"
            >
              Northern Ireland Private Tenancy -&gt;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
