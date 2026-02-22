/**
 * ComparisonTables Component
 *
 * Two comparison tables for marketing pages:
 * 1. Landlord Heaven vs Solicitor
 * 2. Landlord Heaven vs Free Starter Document
 *
 * DEFENSIBLE POSITIONING (as of Jan 2026):
 * - No specific price claims without citation
 * - Focus on feature differences, not savings amounts
 * - Include disclaimer about not being legal representation
 */

import { RiCheckboxCircleLine, RiCloseLine } from 'react-icons/ri';
import { PRODUCTS } from '@/lib/pricing/products';

export interface ComparisonTableProps {
  /** Which product to show pricing for */
  product?: 'notice_only' | 'complete_pack' | 'money_claim' | 'ast_standard' | 'ast_premium';
}

interface ComparisonRow {
  feature: string;
  landlordHeaven: boolean | string;
  competitor: boolean | string;
}

// ========================================
// VS SOLICITOR COMPARISON
// ========================================

export function VsSolicitorComparison({ product = 'notice_only' }: ComparisonTableProps) {
  const productConfig = PRODUCTS[product];
  const price = productConfig?.displayPrice || '£49.99';

  const rows: ComparisonRow[] = [
    {
      feature: 'Price',
      landlordHeaven: `${price} one-time`,
      competitor: 'Typically £200-2,500+ (hourly fees)',
    },
    {
      feature: 'Speed',
      landlordHeaven: 'Instant generation',
      competitor: 'Days to weeks',
    },
    {
      feature: 'Availability',
      landlordHeaven: '24/7, including weekends',
      competitor: 'Business hours only',
    },
    {
      feature: 'Preview before paying',
      landlordHeaven: true,
      competitor: false,
    },
    {
      feature: 'Edit and regenerate',
      landlordHeaven: 'Unlimited, no extra cost',
      competitor: 'Extra fees for redrafts',
    },
    {
      feature: 'Document storage',
      landlordHeaven: 'At least 12 months in portal',
      competitor: 'Varies',
    },
    {
      feature: 'England, Wales, Scotland support',
      landlordHeaven: true,
      competitor: 'Depends on firm',
    },
    {
      feature: 'AI guidance throughout',
      landlordHeaven: true,
      competitor: false,
    },
    {
      feature: 'Legal representation in court',
      landlordHeaven: false,
      competitor: true,
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-charcoal">Landlord Heaven vs Solicitor</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-charcoal border-b border-gray-200">
                Feature
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-primary border-b border-gray-200">
                Landlord Heaven
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-500 border-b border-gray-200">
                Typical Solicitor
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">
                  {row.feature}
                </td>
                <td className="px-6 py-4 text-center border-b border-gray-100">
                  {renderCell(row.landlordHeaven, true)}
                </td>
                <td className="px-6 py-4 text-center border-b border-gray-100">
                  {renderCell(row.competitor, false)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          <strong>Note:</strong> Landlord Heaven provides document generation and guidance. We do not
          provide legal representation or advice tailored to your specific circumstances.
        </p>
      </div>
    </div>
  );
}

// ========================================
// VS FREE STARTER DOCUMENT COMPARISON
// ========================================

export function VsFreeTemplateComparison({ product = 'notice_only' }: ComparisonTableProps) {
  const productConfig = PRODUCTS[product];
  const price = productConfig?.displayPrice || '£49.99';

  const rows: ComparisonRow[] = [
    {
      feature: 'Price',
      landlordHeaven: price,
      competitor: 'Free',
    },
    {
      feature: 'Dates auto-calculated',
      landlordHeaven: true,
      competitor: false,
    },
    {
      feature: 'Jurisdiction correctness',
      landlordHeaven: 'England, Wales, Scotland specific',
      competitor: 'Often generic/outdated',
    },
    {
      feature: 'Compliance blockers flagged',
      landlordHeaven: true,
      competitor: false,
    },
    {
      feature: 'Service instructions included',
      landlordHeaven: true,
      competitor: 'Rarely',
    },
    {
      feature: 'Preview before download',
      landlordHeaven: true,
      competitor: 'Sometimes',
    },
    {
      feature: 'Edit and regenerate',
      landlordHeaven: 'Unlimited',
      competitor: 'Manual editing only',
    },
    {
      feature: 'Portal storage',
      landlordHeaven: 'At least 12 months',
      competitor: false,
    },
    {
      feature: 'Ask Heaven guidance',
      landlordHeaven: true,
      competitor: false,
    },
    {
      feature: 'Official form formats',
      landlordHeaven: 'Government-approved forms',
      competitor: 'Varies widely',
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-charcoal">Landlord Heaven vs Free Starter Documents</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-charcoal border-b border-gray-200">
                Feature
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-primary border-b border-gray-200">
                Landlord Heaven
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-500 border-b border-gray-200">
                Free Starter Documents
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-100">
                  {row.feature}
                </td>
                <td className="px-6 py-4 text-center border-b border-gray-100">
                  {renderCell(row.landlordHeaven, true)}
                </td>
                <td className="px-6 py-4 text-center border-b border-gray-100">
                  {renderCell(row.competitor, false)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 bg-purple-50 border-t border-gray-200">
        <p className="text-sm text-gray-700">
          <strong>Why pay?</strong> Free templates often use outdated forms, wrong jurisdiction
          rules, and leave you guessing on dates and service methods. Invalid notices waste time and
          money — getting it right the first time is worth far more than{' '}
          <span className="font-semibold text-primary">{price}</span>.
        </p>
      </div>
    </div>
  );
}

// ========================================
// HELPER
// ========================================

function renderCell(value: boolean | string, isPositive: boolean) {
  if (typeof value === 'boolean') {
    return value ? (
      <RiCheckboxCircleLine className={`w-5 h-5 mx-auto ${isPositive ? 'text-green-500' : 'text-gray-400'}`} />
    ) : (
      <RiCloseLine className="w-5 h-5 mx-auto text-gray-300" />
    );
  }

  return (
    <span className={`text-sm ${isPositive ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
      {value}
    </span>
  );
}

export default { VsSolicitorComparison, VsFreeTemplateComparison };
