'use client';

import { useEffect } from 'react';

const STICKY_BREAKING_OVERFLOW = new Set(['hidden', 'clip', 'auto', 'scroll']);

function getElementLabel(element: Element): string {
  const htmlElement = element as HTMLElement;
  const idPart = htmlElement.id ? `#${htmlElement.id}` : '';
  const classPart = htmlElement.classList.length > 0 ? `.${Array.from(htmlElement.classList).join('.')}` : '';
  return `${element.tagName.toLowerCase()}${idPart}${classPart}`;
}

function getStickyBreaker(element: HTMLElement): string | null {
  const style = window.getComputedStyle(element);
  const overflow = style.overflow;
  const overflowX = style.overflowX;
  const overflowY = style.overflowY;

  if (STICKY_BREAKING_OVERFLOW.has(overflow)) return `overflow:${overflow}`;
  if (STICKY_BREAKING_OVERFLOW.has(overflowX)) return `overflow-x:${overflowX}`;
  if (STICKY_BREAKING_OVERFLOW.has(overflowY)) return `overflow-y:${overflowY}`;

  if (style.transform !== 'none') return `transform:${style.transform}`;
  if (style.filter !== 'none') return `filter:${style.filter}`;
  if (style.backdropFilter !== 'none') return `backdrop-filter:${style.backdropFilter}`;
  if (style.perspective !== 'none') return `perspective:${style.perspective}`;

  const contain = style.contain;
  if (contain.includes('paint') || contain.includes('layout')) return `contain:${contain}`;

  const willChange = style.willChange;
  if (willChange.includes('transform')) return `will-change:${willChange}`;

  return null;
}

export function BlogArticleStickyGuard() {
  useEffect(() => {
    document.documentElement.classList.add('blog-article-sticky-safe');
    document.body.classList.add('blog-article-sticky-safe');

    return () => {
      document.documentElement.classList.remove('blog-article-sticky-safe');
      document.body.classList.remove('blog-article-sticky-safe');
    };
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_BLOG_STICKY_DEBUG !== '1') {
      return;
    }

    const stickyNode = document.querySelector<HTMLElement>('[data-blog-sticky-inner]');

    if (!stickyNode) {
      console.warn('[blog:sticky-debug] Sticky node not found (expected [data-blog-sticky-inner]).');
      return;
    }

    let cursor = stickyNode.parentElement;
    while (cursor) {
      const breaker = getStickyBreaker(cursor);
      if (breaker) {
        console.warn('[blog:sticky-debug] Sticky breaker detected', {
          stickyNode: getElementLabel(stickyNode),
          breakerElement: getElementLabel(cursor),
          reason: breaker,
          classList: Array.from(cursor.classList),
        });
        return;
      }
      cursor = cursor.parentElement;
    }

    console.info('[blog:sticky-debug] No sticky-breakers found in sticky ancestry.', {
      stickyNode: getElementLabel(stickyNode),
    });
  }, []);

  return null;
}
