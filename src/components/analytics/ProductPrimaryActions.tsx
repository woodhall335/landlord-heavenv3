'use client';

import Link from 'next/link';
import { recordMarketingGrowthEvent } from '@/lib/analytics/growth-events';

export function ProductPrimaryActions({
  pagePath,
  productSlug,
  price,
  primary,
  secondary,
}: {
  pagePath: string;
  productSlug: string;
  price?: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <>
      <Link
        href={primary.href}
        className="hero-btn-primary flex w-full justify-center text-center sm:w-auto"
        onClick={() =>
          recordMarketingGrowthEvent('product_primary_cta_click', {
            sourcePage: pagePath,
            pagePath,
            pageType: 'product_page',
            destination: primary.href,
            recommendedProduct: productSlug,
            productSlug,
            price,
          })
        }
      >
        {primary.label}
      </Link>
      {secondary ? (
        <Link
          href={secondary.href}
          className="hero-btn-secondary flex w-full justify-center text-center sm:w-auto"
        >
          {secondary.label}
        </Link>
      ) : null}
    </>
  );
}

