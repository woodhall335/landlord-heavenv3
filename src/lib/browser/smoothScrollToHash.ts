export function smoothScrollToHash(hash: string) {
  if (!hash.startsWith('#')) {
    return false;
  }

  const targetId = decodeURIComponent(hash.slice(1));
  const target = document.getElementById(targetId);

  if (!target) {
    return false;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  target.scrollIntoView({
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
    block: 'start',
  });

  window.history.pushState(null, '', hash);

  return true;
}
