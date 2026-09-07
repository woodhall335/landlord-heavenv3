'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, type ReactNode } from 'react';

import { trackEvent } from '@/lib/analytics';

type CtaVariant = 'primary' | 'secondary';

export interface CommercialSeoTrackedCtaProps {
  href: string;
  label: string;
  children: ReactNode;
  className: string;
  variant: CtaVariant;
  sourcePage?: string;
  pageType?: string;
  intent?: string;
  ctaPosition?: string;
  recommendedProduct?: string;
  price?: string;
}

function destinationPath(href: string) {
  if (href.startsWith('http://') || href.startsWith('https://')) {
    try {
      return new URL(href).pathname;
    } catch {
      return href;
    }
  }

  return href;
}

function inferProduct(href: string) {
  if (href.includes('money-claim')) return 'money_claim';
  if (href.includes('complete-pack')) return 'complete_pack';
  if (href.includes('notice-only') || href.includes('product=notice_only')) return 'notice_only';
  if (href.includes('section-13-standard')) return 'section13_standard';
  if (href.includes('section-13-defence')) return 'section13_defensive';
  if (
    href.includes('/products/ast') ||
    href.includes('tenancy-agreement') ||
    href.includes('lodger-agreement')
  ) {
    return 'tenancy_agreement';
  }

  return undefined;
}

function pagePathFromBrowser() {
  if (typeof window === 'undefined') return undefined;
  return `${window.location.pathname}${window.location.search}`;
}

export function CommercialSeoTrackedCta({
  href,
  label,
  children,
  className,
  variant,
  sourcePage,
  pageType = 'guide',
  intent,
  ctaPosition = 'mid',
  recommendedProduct,
  price,
}: CommercialSeoTrackedCtaProps) {
  const hasTrackedImpression = useRef(false);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const destination = destinationPath(href);
  const inferredProduct = inferProduct(href);
  const resolvedRecommendedProduct = recommendedProduct || inferredProduct;
  const productClicked = pageType === 'product_page' ? resolvedRecommendedProduct : inferredProduct;
  const payload = useMemo(() => {
    const pagePath = sourcePage || pagePathFromBrowser() || destination;

    return {
      sourcePage: sourcePage || pagePath,
      pagePath,
      pageType,
      intent: intent || resolvedRecommendedProduct || destination,
      ctaPosition,
      destination,
      recommendedProduct: resolvedRecommendedProduct,
      productClicked,
      ctaLabel: label,
      ctaVariant: variant,
      price,
      userType: 'landlord',
    };
  }, [
    ctaPosition,
    destination,
    intent,
    label,
    pageType,
    productClicked,
    price,
    resolvedRecommendedProduct,
    sourcePage,
    variant,
  ]);

  useEffect(() => {
    if (hasTrackedImpression.current) return;
    const element = linkRef.current;
    if (!element) return;

    const recordVisibleImpression = () => {
      if (hasTrackedImpression.current) return;
      hasTrackedImpression.current = true;
      trackEvent('journey_cta_impression', payload, {
        dedupeScope: 'page',
        dedupeKey: `${payload.pagePath}:${destination}:${variant}:journey_cta_impression`,
      });
    };

    if (typeof IntersectionObserver === 'undefined') {
      recordVisibleImpression();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        recordVisibleImpression();
        observer.disconnect();
      },
      { threshold: 0.5 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [destination, payload, variant]);

  return (
    <Link
      ref={linkRef}
      href={href}
      className={className}
      data-commercial-tracked="true"
      data-testid={variant === 'primary' ? 'guide-primary-cta' : undefined}
      onClick={() => {
        trackEvent('journey_cta_click', payload);
        if (pageType === 'product_page' && variant === 'primary') {
          trackEvent('product_primary_cta_click', payload);
        } else if (productClicked || destination.startsWith('/products/')) {
          trackEvent('product_cta_clicked', payload);
        }
      }}
    >
      {children}
    </Link>
  );
}
