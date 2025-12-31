/**
 * CostComparison Component (Fixed)
 *
 * Shows "vs Solicitor" pricing comparison to anchor value proposition.
 *
 * Fixes Applied:
 * - Complete Pack solicitor price updated to £1,500-2,500
 * - Added hover effects to price anchor cards
 * - Uses hero-btn-primary class for CTA
 * - Enhanced animations and transitions
 */

import Link from 'next/link';
import { Container } from '@/components/ui';
import { RiCloseLine, RiCheckLine } from 'react-icons/ri';

function ComparisonItem({
  positive,
  children
}: {
  positive: boolean;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      {positive ? (
        <RiCheckLine className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
      ) : (
        <RiCloseLine className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
      )}
      <span className={positive ? 'text-gray-700' : 'text-gray-500'}>{children}</span>
    </li>
  );
}

export function CostComparison() {
  return (
    <section className="py-20 md:py-24 bg-white">
      <Container>
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-14">
            <div className="inline-block bg-green-100 rounded-full px-4 py-2 mb-4">
              <span className="text-sm font-semibold text-green-700">Save 80%+ on Legal Fees</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Pay Expensive Solicitor Fees?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get the same court-ready documents for a fraction of the cost — instantly.
            </p>
          </div>

          {/* Comparison Cards */}
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {/* Solicitor Column */}
            <div className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-200 hover:border-[#7C3AED] hover:shadow-lg transition-all duration-300 cursor-default">
              <div className="text-center mb-8">
                <div className="text-gray-500 text-sm font-semibold uppercase tracking-wide mb-2">
                  Typical Solicitor
                </div>
                <div className="text-4xl md:text-5xl font-bold text-gray-400 line-through decoration-red-400 decoration-2">
                  £300-2,500
                </div>
                <div className="text-gray-500 mt-1">depending on case</div>
              </div>

              <ul className="space-y-4">
                <ComparisonItem positive={false}>
                  <span className="font-medium">Wait 3-5 business days</span> for documents
                </ComparisonItem>
                <ComparisonItem positive={false}>
                  <span className="font-medium">Book appointments</span> during work hours
                </ComparisonItem>
                <ComparisonItem positive={false}>
                  <span className="font-medium">Limited availability</span> — closed evenings & weekends
                </ComparisonItem>
                <ComparisonItem positive={false}>
                  <span className="font-medium">Extra fees</span> for revisions and changes
                </ComparisonItem>
                <ComparisonItem positive={false}>
                  <span className="font-medium">Travel required</span> for in-person meetings
                </ComparisonItem>
              </ul>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  <span className="font-semibold">Source:</span> Average UK solicitor fees for residential landlord matters (2024)
                </div>
              </div>
            </div>

            {/* Landlord Heaven Column */}
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-8 border-2 border-primary relative shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              {/* Popular Badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md animate-subtle-pulse">
                  SAVE 80%+
                </span>
              </div>

              <div className="text-center mb-8">
                <div className="text-primary text-sm font-semibold uppercase tracking-wide mb-2">
                  Landlord Heaven
                </div>
                <div className="text-4xl md:text-5xl font-bold text-gray-900">
                  £29.99
                </div>
                <div className="text-gray-500 mt-1">for eviction notices</div>
              </div>

              <ul className="space-y-4">
                <ComparisonItem positive={true}>
                  <span className="font-medium">Instant download</span> — get documents in minutes
                </ComparisonItem>
                <ComparisonItem positive={true}>
                  <span className="font-medium">No appointments</span> — generate documents anytime
                </ComparisonItem>
                <ComparisonItem positive={true}>
                  <span className="font-medium">Available 24/7</span> — including evenings & weekends
                </ComparisonItem>
                <ComparisonItem positive={true}>
                  <span className="font-medium">Unlimited edits</span> included at no extra cost
                </ComparisonItem>
                <ComparisonItem positive={true}>
                  <span className="font-medium">All from home</span> — no travel required
                </ComparisonItem>
              </ul>

              <div className="mt-8">
                <Link
                  href="/wizard"
                  className="hero-btn-primary block w-full text-center"
                >
                  Start Saving Now →
                </Link>
              </div>
            </div>
          </div>

          {/* Product Price Anchors - Updated with correct solicitor prices and hover effects */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            <PriceAnchor
              product="Eviction Notices"
              ourPrice="£29.99"
              solicitorPrice="£200-300"
              savings="£170+"
              href="/products/notice-only"
            />
            <PriceAnchor
              product="Complete Pack"
              ourPrice="£149.99"
              solicitorPrice="£1,500-2,500"
              savings="£1,350+"
              href="/products/complete-pack"
              highlighted
            />
            <PriceAnchor
              product="Money Claims"
              ourPrice="£179.99"
              solicitorPrice="£400-600"
              savings="£220+"
              href="/products/money-claim"
            />
            <PriceAnchor
              product="Tenancy Agreements"
              ourPrice="£9.99"
              solicitorPrice="£150-400"
              savings="£140+"
              href="/products/ast"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

function PriceAnchor({
  product,
  ourPrice,
  solicitorPrice,
  savings,
  highlighted,
  href,
}: {
  product: string;
  ourPrice: string;
  solicitorPrice: string;
  savings: string;
  highlighted?: boolean;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-xl p-4 text-center border-2 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1 cursor-pointer group hover:border-[#7C3AED] ${
        highlighted
          ? 'bg-purple-50 border-purple-200'
          : 'bg-gray-50 border-gray-100'
      }`}
    >
      <div className="text-sm font-medium text-gray-700 mb-2 group-hover:text-primary transition-colors">{product}</div>
      <div className="text-xl font-bold text-primary">{ourPrice}</div>
      <div className="text-xs text-gray-400 line-through">{solicitorPrice}</div>
      <div className={`text-xs font-semibold mt-1 ${highlighted ? 'text-primary' : 'text-green-600'}`}>
        Save {savings}
      </div>
    </Link>
  );
}

export default CostComparison;
