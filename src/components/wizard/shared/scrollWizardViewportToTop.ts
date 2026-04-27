'use client';

export function scrollWizardViewportToTop(behavior: ScrollBehavior = 'smooth') {
  if (typeof window === 'undefined') {
    return;
  }

  if (/jsdom/i.test(window.navigator.userAgent)) {
    return;
  }

  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior });
    document.documentElement.scrollTo?.({ top: 0, behavior });
    document.body.scrollTo?.({ top: 0, behavior });
  });
}
