'use client';

import Link from 'next/link';
import type { MouseEvent, ReactNode } from 'react';
import {
  trackAddToCart,
  trackMarketingCtaClick,
  type MarketingCtaPosition,
  type MarketingPageType,
} from '@/lib/analytics';
import { PRODUCTS, type ProductSku } from '@/lib/pricing/products';

type TrackingEventName =
  | 'homepage_primary_cta_click'
  | 'homepage_selector_option_click'
  | 'entry_page_primary_cta_click'
  | 'entry_page_secondary_cta_click'
  | 'product_route_chosen';

function resolveDestinationPath(href: string): string {
  if (href.startsWith('http://') || href.startsWith('https://')) {
    try {
      return new URL(href).pathname;
    } catch {
      return href;
    }
  }

  return href;
}

function getTrackableProduct(product?: string) {
  if (!product) return null;

  if (product === 'tenancy_agreement') {
    return PRODUCTS.ast_standard;
  }

  return product in PRODUCTS ? PRODUCTS[product as ProductSku] : null;
}

export function TrackedLink({
  href,
  children,
  className,
  pagePath,
  pageType,
  ctaLabel,
  ctaPosition,
  eventName,
  routeIntent,
  product,
  onClick,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  pagePath: string;
  pageType: MarketingPageType;
  ctaLabel: string;
  ctaPosition: MarketingCtaPosition;
  eventName: TrackingEventName;
  routeIntent?: string;
  product?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={(event) => {
        const trackedProduct = href.includes('/wizard') ? getTrackableProduct(product) : null;
        if (trackedProduct) {
          trackAddToCart(trackedProduct.sku, trackedProduct.label, trackedProduct.price);
        }

        trackMarketingCtaClick({
          eventName,
          pagePath,
          pageType,
          ctaLabel,
          ctaPosition,
          destinationPath: resolveDestinationPath(href),
          routeIntent,
          product,
        });
        onClick?.(event);
      }}
    >
      {children}
    </Link>
  );
}

export default TrackedLink;
