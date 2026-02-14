/**
 * Post-Purchase Cross-Sell Component
 *
 * Displays contextual product recommendations after a purchase
 * based on the product that was just bought.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { RiArrowRightLine } from 'react-icons/ri';
import { BadgePoundSterling, FileText, Home } from 'lucide-react';
import { PRODUCTS } from '@/lib/pricing/products';

interface CrossSellItem {
  product: string;
  title: string;
  description: string;
  price: string;
  href: string;
  icon: React.ReactNode;
  primary?: boolean;
}

interface PostPurchaseCrossSellProps {
  /** The product that was just purchased */
  purchasedProduct: string;
  /** The case ID for tracking */
  caseId?: string;
  /** Additional CSS classes */
  className?: string;
}

const CROSS_SELL_MAP: Record<string, CrossSellItem[]> = {
  // Notice Only buyers → Complete Pack + Money Claim
  notice_only: [
    {
      product: 'complete_pack',
      title: 'Need court forms?',
      description: 'Upgrade to the Complete Pack for N5, N119, witness statement, and filing guide.',
      price: PRODUCTS.complete_pack.displayPrice,
      href: '/wizard?product=complete_pack&src=dashboard_crosssell',
      icon: <FileText className="w-5 h-5 text-primary" />,
      primary: true,
    },
    {
      product: 'money_claim',
      title: 'Recover unpaid rent',
      description: 'Use our Money Claim Pack to pursue rent arrears through the courts.',
      price: PRODUCTS.money_claim.displayPrice,
      href: '/wizard?product=money_claim&src=dashboard_crosssell',
      icon: <BadgePoundSterling className="w-5 h-5 text-blue-600" />,
    },
  ],
  // Complete Pack buyers → Money Claim
  complete_pack: [
    {
      product: 'money_claim',
      title: 'Also recover unpaid rent?',
      description: 'Eviction gets you possession. A money claim recovers what you\'re owed.',
      price: PRODUCTS.money_claim.displayPrice,
      href: '/wizard?product=money_claim&src=dashboard_crosssell',
      icon: <BadgePoundSterling className="w-5 h-5 text-blue-600" />,
      primary: true,
    },
  ],
  // Money Claim buyers → Eviction products
  money_claim: [
    {
      product: 'notice_only',
      title: 'Need to evict too?',
      description: 'Get an eviction notice if you also need the tenant to leave the property.',
      price: PRODUCTS.notice_only.displayPrice,
      href: '/wizard?product=notice_only&src=dashboard_crosssell',
      icon: <FileText className="w-5 h-5 text-primary" />,
      primary: true,
    },
    {
      product: 'complete_pack',
      title: 'Full eviction pack',
      description: 'Complete court-ready package with N5, N119, and witness statement.',
      price: PRODUCTS.complete_pack.displayPrice,
      href: '/wizard?product=complete_pack&src=dashboard_crosssell',
      icon: <FileText className="w-5 h-5 text-primary" />,
    },
  ],
  // AST buyers → Eviction products
  ast_standard: [
    {
      product: 'notice_only',
      title: 'What if you need to evict?',
      description: 'If issues arise, our Notice Only Pack has you covered from day one.',
      price: PRODUCTS.notice_only.displayPrice,
      href: '/wizard?product=notice_only&src=dashboard_crosssell',
      icon: <FileText className="w-5 h-5 text-primary" />,
    },
  ],
  ast_premium: [
    {
      product: 'notice_only',
      title: 'What if you need to evict?',
      description: 'If issues arise, our Notice Only Pack has you covered from day one.',
      price: PRODUCTS.notice_only.displayPrice,
      href: '/wizard?product=notice_only&src=dashboard_crosssell',
      icon: <FileText className="w-5 h-5 text-primary" />,
    },
  ],
};

export function PostPurchaseCrossSell({
  purchasedProduct,
  caseId,
  className = '',
}: PostPurchaseCrossSellProps) {
  const crossSellItems = CROSS_SELL_MAP[purchasedProduct];

  // No cross-sell items for this product
  if (!crossSellItems || crossSellItems.length === 0) {
    return null;
  }

  return (
    <div className={`bg-gray-50 rounded-xl border border-gray-200 p-5 ${className}`}>
      <h3 className="font-semibold text-charcoal mb-4 text-sm uppercase tracking-wide">
        You might also need
      </h3>
      <div className="space-y-3">
        {crossSellItems.map((item) => (
          <Link
            key={item.product}
            href={item.href}
            className={`block rounded-lg border p-4 transition-all hover:shadow-md ${
              item.primary
                ? 'bg-white border-primary/30 hover:border-primary'
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                item.primary ? 'bg-primary/10' : 'bg-gray-100'
              }`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-semibold text-charcoal text-sm">{item.title}</h4>
                  <span className="text-sm font-bold text-primary whitespace-nowrap">
                    {item.price}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {item.description}
                </p>
              </div>
              <RiArrowRightLine className="w-4 h-4 text-gray-400 shrink-0 mt-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
