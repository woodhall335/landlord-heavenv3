/**
 * ComparisonTables Component
 *
 * Two comparison tables for marketing pages:
 * 1. Landlord Heaven vs Solicitor
 * 2. Landlord Heaven vs Free Starter Document
 */

import { RiCheckboxCircleLine, RiCloseLine } from 'react-icons/ri';
import { PRODUCTS } from '@/lib/pricing/products';

export interface ComparisonTableProps {
  product?: 'notice_only' | 'complete_pack' | 'money_claim' | 'ast_standard' | 'ast_premium';
}

interface ComparisonRow {
  feature: string;
  landlordHeaven: boolean | string;
  competitor: boolean | string;
}

export function VsSolicitorComparison({ product = 'notice_only' }: ComparisonTableProps) {
  const productConfig = PRODUCTS[product];
  const price = productConfig?.displayPrice || PRODUCTS.notice_only.displayPrice;

  const rows: ComparisonRow[] = [
    {
      feature: 'Price',
      landlordHeaven: `${price} one-time`,
      competitor: 'Typically higher and often billed by the hour',
    },
    {
      feature: 'Speed',
      landlordHeaven: 'Start now',
      competitor: 'Usually slower to get moving',
    },
    {
      feature: 'Availability',
      landlordHeaven: 'Use it whenever you have time',
      competitor: 'Usually tied to office hours',
    },
    {
      feature: 'Preview before paying',
      landlordHeaven: true,
      competitor: false,
    },
    {
      feature: 'Edit and regenerate',
      landlordHeaven: 'Update your answers and regenerate without extra charges',
      competitor: 'Redrafts may mean more fees',
    },
    {
      feature: 'Document storage',
      landlordHeaven: 'At least 12 months in your account',
      competitor: 'Depends on the firm',
    },
    {
      feature: 'England landlord routes',
      landlordHeaven: 'Public products focused on England',
      competitor: 'Depends on the firm',
    },
    {
      feature: 'Guidance while you prepare documents',
      landlordHeaven: 'Plain-English guidance while you work through it',
      competitor: false,
    },
    {
      feature: 'Legal representation in court',
      landlordHeaven: false,
      competitor: true,
    },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <h3 className="text-lg font-semibold text-charcoal">Landlord Heaven vs Solicitor</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="border-b border-gray-200 px-6 py-3 text-left text-sm font-semibold text-charcoal">
                Feature
              </th>
              <th className="border-b border-gray-200 px-6 py-3 text-center text-sm font-semibold text-primary">
                Landlord Heaven
              </th>
              <th className="border-b border-gray-200 px-6 py-3 text-center text-sm font-semibold text-gray-500">
                Typical Solicitor
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.feature} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border-b border-gray-100 px-6 py-4 text-sm text-gray-700">
                  {row.feature}
                </td>
                <td className="border-b border-gray-100 px-6 py-4 text-center">
                  {renderCell(row.landlordHeaven, true)}
                </td>
                <td className="border-b border-gray-100 px-6 py-4 text-center">
                  {renderCell(row.competitor, false)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
        <p className="text-xs text-gray-500">
          <strong>Note:</strong> Landlord Heaven provides document generation and guidance.
          We do not provide legal representation or advice tailored to your specific
          circumstances.
        </p>
      </div>
    </div>
  );
}

export function VsFreeTemplateComparison({ product = 'notice_only' }: ComparisonTableProps) {
  const productConfig = PRODUCTS[product];
  const price = productConfig?.displayPrice || PRODUCTS.notice_only.displayPrice;

  const rows: ComparisonRow[] = [
    {
      feature: 'Price',
      landlordHeaven: `${price} one-time`,
      competitor: 'Free',
    },
    {
      feature: 'Dates auto-calculated',
      landlordHeaven: 'Yes, so you are not counting notice dates by hand',
      competitor: false,
    },
    {
      feature: 'Right documents for where the property is',
      landlordHeaven: 'Built for England, Wales, or Scotland',
      competitor: 'Often generic or out of date',
    },
    {
      feature: 'Problems flagged before you generate',
      landlordHeaven: 'Yes, before you serve anything',
      competitor: false,
    },
    {
      feature: 'Service instructions included',
      landlordHeaven: 'Yes, with the pack',
      competitor: 'Rarely included',
    },
    {
      feature: 'Preview before download',
      landlordHeaven: 'Yes',
      competitor: 'Sometimes',
    },
    {
      feature: 'Edit and regenerate',
      landlordHeaven: 'Update answers and regenerate fast',
      competitor: 'Manual editing only',
    },
    {
      feature: 'Portal storage',
      landlordHeaven: 'At least 12 months in your account',
      competitor: false,
    },
    {
      feature: 'Ask Heaven guidance',
      landlordHeaven: 'Yes, for route and blocker checks',
      competitor: false,
    },
    {
      feature: 'Official form formats',
      landlordHeaven: 'Built on the forms courts and tribunals expect',
      competitor: 'Varies widely',
    },
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <h3 className="text-lg font-semibold text-charcoal">
          Landlord Heaven vs Free Starter Documents
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="border-b border-gray-200 px-6 py-3 text-left text-sm font-semibold text-charcoal">
                Feature
              </th>
              <th className="border-b border-gray-200 px-6 py-3 text-center text-sm font-semibold text-primary">
                Landlord Heaven
              </th>
              <th className="border-b border-gray-200 px-6 py-3 text-center text-sm font-semibold text-gray-500">
                Free Starter Documents
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.feature} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border-b border-gray-100 px-6 py-4 text-sm text-gray-700">
                  {row.feature}
                </td>
                <td className="border-b border-gray-100 px-6 py-4 text-center">
                  {renderCell(row.landlordHeaven, true)}
                </td>
                <td className="border-b border-gray-100 px-6 py-4 text-center">
                  {renderCell(row.competitor, false)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-gray-200 bg-purple-50 px-6 py-4">
        <p className="text-sm text-gray-700">
          <strong>Why pay?</strong> Free templates can leave you guessing on dates,
          service, and whether the form is even right for your property. One bad notice
          can cost far more time and money than{' '}
          <span className="font-semibold text-primary">{price}</span>.
        </p>
      </div>
    </div>
  );
}

function renderCell(value: boolean | string, isPositive: boolean) {
  if (typeof value === 'boolean') {
    return value ? (
      <RiCheckboxCircleLine
        className={`mx-auto h-5 w-5 ${isPositive ? 'text-green-500' : 'text-gray-400'}`}
      />
    ) : (
      <RiCloseLine className="mx-auto h-5 w-5 text-gray-300" />
    );
  }

  return (
    <span className={`text-sm ${isPositive ? 'font-medium text-gray-700' : 'text-gray-500'}`}>
      {value}
    </span>
  );
}

export default { VsSolicitorComparison, VsFreeTemplateComparison };
