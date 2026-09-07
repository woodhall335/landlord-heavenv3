'use client';

import { useEffect } from 'react';

import { recordMarketingGrowthEvent } from '@/lib/analytics/growth-events';

const PRODUCT_ROUTES = [
  '/products/',
  '/standard-tenancy-agreement',
  '/premium-tenancy-agreement',
  '/student-tenancy-agreement',
  '/hmo-shared-house-tenancy-agreement',
  '/lodger-agreement',
  '/wizard/flow',
  '/assisted-prep',
] as const;

function destinationPath(anchor: HTMLAnchorElement) {
  try {
    return new URL(anchor.href, window.location.origin).pathname;
  } catch {
    return anchor.getAttribute('href') || '';
  }
}

function isCommercialDestination(pathname: string) {
  return PRODUCT_ROUTES.some((route) =>
    route.endsWith('/') ? pathname.startsWith(route) : pathname === route || pathname.startsWith(`${route}/`)
  );
}

function productFromDestination(pathname: string) {
  if (pathname.includes('notice-only')) return 'notice_only';
  if (pathname.includes('complete-pack')) return 'complete_pack';
  if (pathname.includes('money-claim')) return 'money_claim';
  if (pathname.includes('section-13-defence')) return 'section13_defensive';
  if (pathname.includes('section-13') || pathname.includes('rent-increase')) return 'section13_standard';
  if (pathname.includes('premium-tenancy')) return 'england_premium_tenancy_agreement';
  if (pathname.includes('student-tenancy')) return 'england_student_tenancy_agreement';
  if (pathname.includes('hmo-shared-house')) return 'england_hmo_shared_house_tenancy_agreement';
  if (pathname.includes('lodger-agreement')) return 'england_lodger_agreement';
  if (pathname.includes('standard-tenancy')) return 'england_standard_tenancy_agreement';
  if (pathname.includes('/products/ast')) return 'tenancy_agreement';
  return 'commercial_product';
}

function positionFor(anchor: HTMLAnchorElement) {
  const explicit = anchor.closest<HTMLElement>('[data-cta-position]')?.dataset.ctaPosition;
  if (explicit) return explicit;
  const midpoint = anchor.getBoundingClientRect().top + window.scrollY;
  const pageHeight = Math.max(document.documentElement.scrollHeight, 1);
  if (midpoint < pageHeight * 0.25) return 'top';
  if (midpoint > pageHeight * 0.75) return 'bottom';
  return 'mid';
}

function eligibleAnchor(node: Element): node is HTMLAnchorElement {
  if (!(node instanceof HTMLAnchorElement)) return false;
  if (node.dataset.commercialTracked === 'true') return false;
  if (!node.closest('main')) return false;
  if (node.closest('nav, footer, [data-analytics-ignore]')) return false;
  return isCommercialDestination(destinationPath(node));
}

export function CommercialLinkTracker() {
  useEffect(() => {
    const viewed = new WeakSet<HTMLAnchorElement>();
    const observed = new WeakSet<HTMLAnchorElement>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting || !(entry.target instanceof HTMLAnchorElement)) return;
          const anchor = entry.target;
          if (viewed.has(anchor)) return;
          viewed.add(anchor);
          observer.unobserve(anchor);
          const destination = destinationPath(anchor);
          recordMarketingGrowthEvent('journey_cta_impression', {
            sourcePage: `${window.location.pathname}${window.location.search}`,
            pagePath: `${window.location.pathname}${window.location.search}`,
            pageType: window.location.pathname.startsWith('/products/') ? 'product_page' : 'content',
            intent: productFromDestination(destination),
            ctaPosition: positionFor(anchor),
            destination,
            recommendedProduct: productFromDestination(destination),
            ctaLabel: anchor.textContent?.trim().slice(0, 160) || 'commercial link',
          });
        });
      },
      { threshold: 0.5 },
    );

    const observeEligibleLinks = (root: ParentNode = document) => {
      if (root instanceof Element && eligibleAnchor(root) && !observed.has(root)) {
        observed.add(root);
        observer.observe(root);
      }
      root.querySelectorAll('a[href]').forEach((node) => {
        if (!eligibleAnchor(node) || observed.has(node)) return;
        observed.add(node);
        observer.observe(node);
      });
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!target || !eligibleAnchor(target)) return;
      const destination = destinationPath(target);
      const product = productFromDestination(destination);
      const payload = {
        sourcePage: `${window.location.pathname}${window.location.search}`,
        pagePath: `${window.location.pathname}${window.location.search}`,
        pageType: window.location.pathname.startsWith('/products/') ? 'product_page' : 'content',
        intent: product,
        ctaPosition: positionFor(target),
        destination,
        recommendedProduct: product,
        productClicked: product,
        ctaLabel: target.textContent?.trim().slice(0, 160) || 'commercial link',
      };
      recordMarketingGrowthEvent('journey_cta_click', payload);
      recordMarketingGrowthEvent('product_cta_clicked', payload);
    };

    observeEligibleLinks();
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) observeEligibleLinks(node);
        });
      });
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('click', onClick, true);

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      document.removeEventListener('click', onClick, true);
    };
  }, []);

  return null;
}
