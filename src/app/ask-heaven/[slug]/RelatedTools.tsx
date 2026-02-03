/**
 * Related Tools Component
 *
 * Displays related products and free tools based on question topic.
 * Respects jurisdiction restrictions for product CTAs.
 */

import React from 'react';
import Link from 'next/link';
import type { RelatedToolsConfig } from '@/lib/ask-heaven/questions/linking';
import { buildProductUrl } from '@/lib/ask-heaven/questions/linking';

interface RelatedToolsProps {
  config: RelatedToolsConfig;
}

/**
 * Related tools sidebar component.
 *
 * Shows:
 * - Product CTAs (filtered by jurisdiction)
 * - Free tool links
 * - Info message for restricted jurisdictions
 */
export function RelatedTools({ config }: RelatedToolsProps) {
  const { products, tools, showProductCTAs, infoMessage } = config;

  // Nothing to show
  if (products.length === 0 && tools.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <h3 className="font-semibold text-gray-900">Related Tools</h3>
      </div>

      <div className="p-4 space-y-4">
        {/* Product CTAs */}
        {showProductCTAs && products.length > 0 && (
          <div className="space-y-3">
            {products.map((product, index) => (
              <ProductCard
                key={product.product}
                product={product}
                isPrimary={index === 0}
              />
            ))}
          </div>
        )}

        {/* Jurisdiction restriction message */}
        {infoMessage && (
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
            <p className="text-xs text-amber-800">{infoMessage}</p>
          </div>
        )}

        {/* Free Tools */}
        {tools.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Free Tools
            </p>
            <ul className="space-y-2">
              {tools.map((tool) => (
                <li key={tool.tool}>
                  <Link
                    href={tool.href}
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary"
                  >
                    <svg
                      className="w-4 h-4 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{tool.name}</span>
                    <span className="text-xs text-green-600 font-medium">
                      FREE
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Product card component for CTA display.
 */
function ProductCard({
  product,
  isPrimary,
}: {
  product: RelatedToolsConfig['products'][0];
  isPrimary: boolean;
}) {
  const url = buildProductUrl(product.href, 'ask_heaven_qa');

  return (
    <div
      className={`rounded-lg border p-3 ${
        isPrimary
          ? 'border-primary bg-primary/5'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4
          className={`font-medium ${
            isPrimary ? 'text-primary' : 'text-gray-900'
          }`}
        >
          {product.name}
        </h4>
        {product.price && (
          <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
            {product.price}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-600 mb-3">{product.description}</p>
      <Link
        href={url}
        className={`block w-full text-center text-sm font-medium py-2 px-3 rounded-lg transition-colors ${
          isPrimary
            ? 'bg-primary text-white hover:bg-primary-700'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {product.ctaText}
      </Link>
    </div>
  );
}
