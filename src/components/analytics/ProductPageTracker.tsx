'use client';

import { useEffect, useRef } from 'react';

import { trackProductView } from '@/lib/analytics';
import { initializeAttribution } from '@/lib/wizard/wizardAttribution';

function parsePriceLabel(label?: string): number | undefined {
  if (!label) return undefined;

  const match = label.match(/\u00a3\s*(\d+(?:\.\d{1,2})?)/);
  if (!match) return undefined;

  const value = Number(match[1]);
  return Number.isFinite(value) ? value : undefined;
}

export function ProductPageTracker({
  pagePath,
  productId,
  productName,
  routeIntent,
  priceLabel,
}: {
  pagePath: string;
  productId: string;
  productName: string;
  routeIntent?: string;
  priceLabel?: string;
}) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current) return;
    hasTracked.current = true;

    initializeAttribution();
    trackProductView(productId, productName, 'landlord_document', parsePriceLabel(priceLabel), {
      sourcePage: pagePath,
      pagePath,
      pageType: 'product_page',
      intent: routeIntent || productId,
      userType: 'landlord',
    });
  }, [pagePath, priceLabel, productId, productName, routeIntent]);

  return null;
}

export default ProductPageTracker;
