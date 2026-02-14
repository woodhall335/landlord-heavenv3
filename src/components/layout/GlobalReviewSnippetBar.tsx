'use client';

import { usePathname } from 'next/navigation';
import { getDynamicReviewCount, REVIEW_RATING } from '@/lib/reviews/reviewStats';

const EXCLUDED_PREFIXES = [
  '/dashboard',
  '/wizard',
  '/auth',
  '/api',
  '/_next',
  '/tools',
  '/privacy',
  '/terms',
  '/refunds',
  '/cookies',
];

function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') {
    return pathname;
  }

  return pathname.replace(/\/+$/, '');
}

function shouldShowReviewSnippet(pathname: string): boolean {
  const normalizedPath = normalizePath(pathname);

  if (!normalizedPath) {
    return false;
  }

  if (
    EXCLUDED_PREFIXES.some(
      (prefix) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`)
    )
  ) {
    return false;
  }

  return true;
}

export function GlobalReviewSnippetBar() {
  const pathname = usePathname();

  if (!shouldShowReviewSnippet(pathname)) {
    return null;
  }

  const reviewCount = getDynamicReviewCount();

  return (
    <div className="border-b border-purple-100 bg-purple-50/80">
      <div className="mx-auto max-w-7xl px-4 py-2 text-center text-sm font-semibold text-[#2b253d] sm:px-6 lg:px-8">
        Rated {REVIEW_RATING} / 5.0 from {reviewCount} reviews
      </div>
    </div>
  );
}
