import retirementConfig from '@/config/retired-public-routes.json';

const ROUTE_REDIRECTS = retirementConfig.routeRedirects as Record<string, string>;
const RETIRED_SKU_REDIRECTS =
  retirementConfig.retiredEnglandDocumentSkuRedirects as Record<string, string>;

export const RETIRED_PUBLIC_ROUTE_REDIRECTS = ROUTE_REDIRECTS;
export const RETIRED_PUBLIC_ROUTES = Object.keys(ROUTE_REDIRECTS);
export const RETIRED_PUBLIC_ROUTE_SET = new Set(RETIRED_PUBLIC_ROUTES);

export const RETIRED_ENGLAND_DOCUMENT_SKUS = [
  ...retirementConfig.retiredEnglandDocumentSkus,
] as string[];
export const RETIRED_ENGLAND_DOCUMENT_SKU_SET = new Set(RETIRED_ENGLAND_DOCUMENT_SKUS);
export const RETIRED_ENGLAND_DOCUMENT_SKU_REDIRECTS = RETIRED_SKU_REDIRECTS;

function normalizePathname(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    try {
      return new URL(value).pathname;
    } catch {
      return null;
    }
  }

  const [pathname] = value.split(/[?#]/, 1);
  return pathname || null;
}

export function isRetiredPublicRoute(pathname: string | null | undefined): boolean {
  const normalized = normalizePathname(pathname);
  return normalized ? RETIRED_PUBLIC_ROUTE_SET.has(normalized) : false;
}

export function getRetiredPublicRouteRedirect(
  pathname: string | null | undefined
): string | null {
  const normalized = normalizePathname(pathname);
  return normalized ? RETIRED_PUBLIC_ROUTE_REDIRECTS[normalized] ?? null : null;
}

export function isRetiredPublicSku(value: string | null | undefined): boolean {
  return Boolean(value && RETIRED_ENGLAND_DOCUMENT_SKU_SET.has(value));
}

export function getRetiredPublicSkuRedirectDestination(
  value: string | null | undefined
): string | null {
  return value ? RETIRED_ENGLAND_DOCUMENT_SKU_REDIRECTS[value] ?? null : null;
}
