'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { recordMarketingGrowthEvent } from '@/lib/analytics/growth-events';

const SEARCH_HOSTS = ['google.', 'bing.com', 'search.yahoo.', 'duckduckgo.com', 'ecosia.org'];

function pageType(pathname: string) {
  if (pathname.startsWith('/blog/')) return 'blog';
  if (pathname.startsWith('/tools/')) return 'tool';
  if (pathname.startsWith('/products/')) return 'product_page';
  return 'guide';
}

export function OrganicLandingTracker({ authenticated }: { authenticated: boolean }) {
  const pathname = usePathname();
  const tracked = useRef(new Set<string>());

  useEffect(() => {
    if (!pathname || tracked.current.has(pathname)) return;
    const params = new URLSearchParams(window.location.search);
    const referrer = document.referrer.toLowerCase();
    const medium = params.get('utm_medium')?.toLowerCase();
    const isOrganic =
      medium === 'organic' ||
      SEARCH_HOSTS.some((host) => referrer.includes(host));

    if (!isOrganic) return;
    tracked.current.add(pathname);
    recordMarketingGrowthEvent('organic_landing_view', {
      sourcePage: pathname,
      pagePath: pathname,
      pageType: pageType(pathname),
      trafficSource: params.get('utm_source') || 'organic_search',
      campaign: params.get('utm_campaign'),
      authenticatedState: authenticated,
      deviceCategory: window.matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop',
    });
  }, [authenticated, pathname]);

  return null;
}

