'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { getDynamicReviewCount, REVIEW_RATING } from '@/lib/reviews/reviewStats';

const EXCLUDED_PREFIXES = ['/dashboard', '/wizard', '/auth', '/api', '/_next', '/tools'];
const EXCLUDED_EXACT = ['/privacy', '/terms', '/refunds', '/cookies'];

function shouldShowReviewSnippet(pathname: string): boolean {
  if (!pathname) {
    return false;
  }

  if (EXCLUDED_EXACT.includes(pathname)) {
    return false;
  }

  if (EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return false;
  }

  return true;
}

export function GlobalReviewSnippetBar() {
  const pathname = usePathname();

  const shouldShow = useMemo(() => shouldShowReviewSnippet(pathname), [pathname]);

  if (!shouldShow) {
    return null;
  }

  const reviewCount = getDynamicReviewCount();

  return (
    <div className="border-b border-purple-100 bg-purple-50/80">
      <div className="mx-auto max-w-7xl px-4 py-2 text-center text-sm font-semibold text-[#2b253d] sm:px-6 lg:px-8">
        Rated {REVIEW_RATING}/5 from {reviewCount} reviews
      </div>
    </div>
  );
}
