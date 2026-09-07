'use client';

import { CommercialSeoTrackedCta } from '@/components/seo/CommercialSeoTrackedCta';

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
      <CommercialSeoTrackedCta
        href={primary.href}
        label={primary.label}
        variant="primary"
        sourcePage={pagePath}
        pageType="product_page"
        intent={productSlug}
        ctaPosition="hero"
        recommendedProduct={productSlug}
        price={price}
        className="hero-btn-primary flex w-full justify-center text-center sm:w-auto"
      >
        {primary.label}
      </CommercialSeoTrackedCta>
      {secondary ? (
        <CommercialSeoTrackedCta
          href={secondary.href}
          label={secondary.label}
          variant="secondary"
          sourcePage={pagePath}
          pageType="product_page"
          intent={productSlug}
          ctaPosition="hero"
          recommendedProduct={productSlug}
          price={price}
          className="hero-btn-secondary flex w-full justify-center text-center sm:w-auto"
        >
          {secondary.label}
        </CommercialSeoTrackedCta>
      ) : null}
    </>
  );
}
