import { OWNER_PAGE_CONTRACTS } from '@/lib/seo/owner-page-contracts';
import {
  getSeoPageTaxonomy,
  type SeoPageTaxonomyEntry,
  type SeoProductRoute,
} from '@/lib/seo/page-taxonomy';

export type CommercialSweepResolution =
  | {
      kind: 'product';
      pathname: string;
      primaryHref: string;
      secondaryHref?: string;
      reason: string;
    }
  | {
      kind: 'jurisdiction_safe';
      pathname: string;
      primaryHref: string;
      message: string;
      jurisdiction: Exclude<SeoPageTaxonomyEntry['jurisdiction'], 'england' | 'uk'> | 'uk';
    };

const OWNER_ROUTE_DESTINATIONS: Record<string, { primaryHref: string; secondaryHref?: string }> = {
  '/products/ast': { primaryHref: '/products/ast' },
  '/products/notice-only': {
    primaryHref: '/products/notice-only',
    secondaryHref: '/products/complete-pack',
  },
  '/products/complete-pack': {
    primaryHref: '/products/complete-pack',
    secondaryHref: '/products/notice-only',
  },
  '/products/money-claim': { primaryHref: '/products/money-claim' },
  '/rent-increase': {
    primaryHref: '/products/section-13-standard',
    secondaryHref: '/products/section-13-defence',
  },
  '/standard-tenancy-agreement': {
    primaryHref: '/standard-tenancy-agreement',
    secondaryHref: '/premium-tenancy-agreement',
  },
  '/premium-tenancy-agreement': {
    primaryHref: '/premium-tenancy-agreement',
    secondaryHref: '/standard-tenancy-agreement',
  },
  '/student-tenancy-agreement': {
    primaryHref: '/student-tenancy-agreement',
    secondaryHref: '/hmo-shared-house-tenancy-agreement',
  },
  '/hmo-shared-house-tenancy-agreement': {
    primaryHref: '/hmo-shared-house-tenancy-agreement',
    secondaryHref: '/premium-tenancy-agreement',
  },
  '/lodger-agreement': {
    primaryHref: '/lodger-agreement',
    secondaryHref: '/standard-tenancy-agreement',
  },
};

const SUPPLEMENTAL_ROUTE_DESTINATIONS: Record<string, { primaryHref: string; secondaryHref?: string }> = {
  '/ast-agreement-template': { primaryHref: '/products/ast' },
  '/compare/section-13-standard-vs-defence': {
    primaryHref: '/products/section-13-standard',
    secondaryHref: '/products/section-13-defence',
  },
  '/compare/section-8-stage-1-vs-stage-2': {
    primaryHref: '/products/notice-only',
    secondaryHref: '/products/complete-pack',
  },
  '/compare/tenancy-agreement-options-england': { primaryHref: '/products/ast' },
  '/hmo-tenancy-agreement-template': {
    primaryHref: '/hmo-shared-house-tenancy-agreement',
    secondaryHref: '/products/ast',
  },
  '/landlord-documents-england': {
    primaryHref: '/products/notice-only',
    secondaryHref: '/products/ast',
  },
  '/lodger-agreement-template': {
    primaryHref: '/lodger-agreement',
    secondaryHref: '/products/ast',
  },
  '/products/money-claim-pack': { primaryHref: '/products/money-claim' },
  '/products/rent-increase': {
    primaryHref: '/products/section-13-standard',
    secondaryHref: '/products/section-13-defence',
  },
  '/products/section-13-standard': {
    primaryHref: '/products/section-13-standard',
    secondaryHref: '/products/section-13-defence',
  },
  '/products/section-13-defence': {
    primaryHref: '/products/section-13-defence',
    secondaryHref: '/products/section-13-standard',
  },
  '/renters-rights-act-information-sheet-2026': { primaryHref: '/products/ast' },
  '/samples': { primaryHref: '/products/notice-only' },
  '/samples/notice-only': { primaryHref: '/products/notice-only' },
  '/tenancy-agreement-england-2026': { primaryHref: '/products/ast' },
  '/tenancy-agreement-template-uk': { primaryHref: '/products/ast' },
};

const TAXONOMY_ROUTE_DESTINATION_OVERRIDES: Record<string, { primaryHref: string; secondaryHref?: string }> = {
  '/6-month-tenancy-agreement-template': {
    primaryHref: '/standard-tenancy-agreement',
    secondaryHref: '/premium-tenancy-agreement',
  },
  '/assured-periodic-tenancy-agreement': {
    primaryHref: '/standard-tenancy-agreement',
    secondaryHref: '/premium-tenancy-agreement',
  },
  '/assured-shorthold-tenancy-agreement-template': {
    primaryHref: '/standard-tenancy-agreement',
    secondaryHref: '/premium-tenancy-agreement',
  },
  '/fixed-term-periodic-tenancy-england': {
    primaryHref: '/standard-tenancy-agreement',
    secondaryHref: '/premium-tenancy-agreement',
  },
  '/fixed-term-tenancy-agreement-template': {
    primaryHref: '/standard-tenancy-agreement',
    secondaryHref: '/premium-tenancy-agreement',
  },
  '/joint-tenancy-agreement-england': {
    primaryHref: '/premium-tenancy-agreement',
    secondaryHref: '/standard-tenancy-agreement',
  },
  '/joint-tenancy-agreement-template': {
    primaryHref: '/premium-tenancy-agreement',
    secondaryHref: '/standard-tenancy-agreement',
  },
  '/renew-tenancy-agreement-england': {
    primaryHref: '/standard-tenancy-agreement',
    secondaryHref: '/premium-tenancy-agreement',
  },
  '/rolling-tenancy-agreement': {
    primaryHref: '/standard-tenancy-agreement',
    secondaryHref: '/premium-tenancy-agreement',
  },
  '/tenancy-agreement-template': {
    primaryHref: '/standard-tenancy-agreement',
    secondaryHref: '/premium-tenancy-agreement',
  },
  '/tenancy-agreements/england': {
    primaryHref: '/standard-tenancy-agreement',
    secondaryHref: '/premium-tenancy-agreement',
  },
};

const NON_ENGLAND_GUIDES: Record<Exclude<SeoPageTaxonomyEntry['jurisdiction'], 'england' | 'uk'> | 'uk', string> = {
  wales: '/wales-tenancy-agreement-template',
  scotland: '/private-residential-tenancy-agreement-template',
  'northern-ireland': '/northern-ireland-tenancy-agreement-template',
  uk: '/landlord-documents-england',
};

const NON_ENGLAND_ROUTE_GUIDE_OVERRIDES: Record<string, string> = {
  '/eviction-process-wales': '/eviction-process-wales',
  '/wales-eviction-notices': '/wales-eviction-notices',
  '/eviction-process-scotland': '/eviction-process-scotland',
  '/scotland-eviction-notices': '/scotland-eviction-notices',
  '/scotland-notice-to-leave-template': '/scotland-eviction-notices',
  '/notice-to-quit-northern-ireland-guide': '/notice-to-quit-northern-ireland-guide',
};

const OWNER_ROUTE_SET = new Set(OWNER_PAGE_CONTRACTS.map((contract) => contract.pathname));

function hasEnglandProductAccess(entry: SeoPageTaxonomyEntry): boolean {
  return entry.jurisdiction === 'england' || entry.jurisdiction === 'uk';
}

function productResolution(
  pathname: string,
  primaryHref: string,
  secondaryHref: string | undefined,
  reason: string
): CommercialSweepResolution {
  const resolvedSecondaryHref = secondaryHref && secondaryHref !== primaryHref ? secondaryHref : undefined;

  return {
    kind: 'product',
    pathname,
    primaryHref,
    secondaryHref: resolvedSecondaryHref,
    reason,
  };
}

function jurisdictionSafeResolution(
  pathname: string,
  entry: SeoPageTaxonomyEntry
): CommercialSweepResolution {
  const jurisdiction = entry.jurisdiction === 'uk' ? 'uk' : entry.jurisdiction;
  const primaryHref =
    NON_ENGLAND_ROUTE_GUIDE_OVERRIDES[pathname] ??
    NON_ENGLAND_GUIDES[jurisdiction] ??
    entry.primaryPillar;

  return {
    kind: 'jurisdiction_safe',
    pathname,
    primaryHref,
    jurisdiction,
    message:
      jurisdiction === 'uk'
        ? 'This page has UK-wide intent; do not present an England-only paid product without first narrowing the jurisdiction.'
        : 'Public paid products are currently England-only; keep this page on jurisdiction-specific guidance or account-resume language.',
  };
}

export function resolveCommercialSweepRoute(pathname: string): CommercialSweepResolution | null {
  const taxonomyEntry = getSeoPageTaxonomy(pathname);
  if (taxonomyEntry) {
    if (!hasEnglandProductAccess(taxonomyEntry)) {
      return jurisdictionSafeResolution(pathname, taxonomyEntry);
    }

    const taxonomyOverride = TAXONOMY_ROUTE_DESTINATION_OVERRIDES[pathname];
    if (taxonomyOverride) {
      return productResolution(
        pathname,
        taxonomyOverride.primaryHref,
        taxonomyOverride.secondaryHref,
        'Resolved from exact commercial destination override.'
      );
    }

    return productResolution(
      pathname,
      taxonomyEntry.primaryProduct,
      taxonomyEntry.secondaryProduct,
      'Resolved from SEO page taxonomy.'
    );
  }

  if (OWNER_ROUTE_SET.has(pathname)) {
    const destination = OWNER_ROUTE_DESTINATIONS[pathname];
    if (!destination) return null;
    return productResolution(
      pathname,
      destination.primaryHref,
      destination.secondaryHref,
      'Resolved from owner-page contract.'
    );
  }

  const supplementalDestination = SUPPLEMENTAL_ROUTE_DESTINATIONS[pathname];
  if (supplementalDestination) {
    return productResolution(
      pathname,
      supplementalDestination.primaryHref,
      supplementalDestination.secondaryHref,
      'Resolved from supplemental sweep contract.'
    );
  }

  return null;
}

export function isSeoProductRoute(href: string): href is SeoProductRoute {
  return href.startsWith('/products/');
}
