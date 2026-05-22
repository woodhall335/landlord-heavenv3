'use client';

import { useEffect } from 'react';
import { smoothScrollToHash } from '@/lib/browser/smoothScrollToHash';

function getSamePageHash(anchor: HTMLAnchorElement) {
  const rawHref = anchor.getAttribute('href');

  if (!rawHref || rawHref === '#') {
    return null;
  }

  if (rawHref.startsWith('#')) {
    return rawHref;
  }

  let url: URL;
  try {
    url = new URL(rawHref, window.location.href);
  } catch {
    return null;
  }

  if (!url.hash || url.origin !== window.location.origin) {
    return null;
  }

  if (url.pathname !== window.location.pathname || url.search !== window.location.search) {
    return null;
  }

  return url.hash;
}

export function SmoothAnchorScroll() {
  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target instanceof Element ? event.target : null;
      const anchor = target?.closest<HTMLAnchorElement>('a[href]');

      if (!anchor || anchor.hasAttribute('download')) {
        return;
      }

      const targetAttribute = anchor.getAttribute('target');
      if (targetAttribute && targetAttribute !== '_self') {
        return;
      }

      const hash = getSamePageHash(anchor);
      if (!hash) {
        return;
      }

      if (smoothScrollToHash(hash)) {
        event.preventDefault();
      }
    }

    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  return null;
}
