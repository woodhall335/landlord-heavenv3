import { normalizeRoute } from '@/lib/wizard/route-normalizer';
import type { CanonicalJurisdiction } from '@/lib/types/jurisdiction';

export type EvictionPackProduct = 'notice_only' | 'complete_pack';

interface RouteResolution {
  selectedNoticeRoute: string;
  evictionRoute: string;
}

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

export function resolveEvictionPackGenerationRoute(
  facts: Record<string, any>,
  jurisdiction: CanonicalJurisdiction,
  selectedRoute?: string | null,
): RouteResolution {
  const rawRoute = firstString(
    selectedRoute,
    facts.selected_notice_route,
    facts.eviction_route,
    facts.eviction_route_intent,
    facts.recommended_route,
    facts.route_recommendation?.recommended_route,
    facts.notice_type,
  );

  let normalizedRoute = normalizeRoute(rawRoute || undefined);

  if (!normalizedRoute) {
    if (jurisdiction === 'scotland') {
      normalizedRoute = 'notice_to_leave';
    } else if (jurisdiction === 'wales') {
      const hasFaultGrounds =
        Array.isArray(facts.wales_fault_grounds) && facts.wales_fault_grounds.length > 0;
      normalizedRoute = hasFaultGrounds ? 'fault_based' : 'section_173';
    } else {
      normalizedRoute = 'section_8';
    }
  }

  if (jurisdiction === 'wales' && (normalizedRoute === 'section_8' || normalizedRoute === 'section_21')) {
    const hasFaultGrounds =
      Array.isArray(facts.wales_fault_grounds) && facts.wales_fault_grounds.length > 0;
    normalizedRoute = hasFaultGrounds ? 'fault_based' : 'section_173';
  }

  const selectedNoticeRoute =
    jurisdiction === 'wales' && normalizedRoute === 'section_173'
      ? 'wales_section_173'
      : jurisdiction === 'wales' && normalizedRoute === 'fault_based'
        ? 'wales_fault_based'
        : normalizedRoute;

  return {
    selectedNoticeRoute,
    evictionRoute: normalizedRoute,
  };
}

export function buildEvictionPackGenerationFacts(params: {
  facts: Record<string, any>;
  caseId: string;
  jurisdiction: CanonicalJurisdiction;
  product: EvictionPackProduct;
  selectedRoute?: string | null;
}): Record<string, any> {
  const { facts, caseId, jurisdiction, product, selectedRoute } = params;
  const route = resolveEvictionPackGenerationRoute(facts, jurisdiction, selectedRoute);

  return {
    ...facts,
    id: caseId,
    case_id: caseId,
    jurisdiction,
    property_country: facts.property_country || jurisdiction,
    property_location:
      facts.property_location || (jurisdiction === 'england' || jurisdiction === 'wales' ? jurisdiction : undefined),
    product,
    product_tier: product,
    pack_type: product === 'complete_pack' ? 'complete' : 'notice_only',
    selected_notice_route: route.selectedNoticeRoute,
    eviction_route: route.evictionRoute,
    recommended_route: route.evictionRoute,
    route_recommendation: {
      ...(facts.route_recommendation || {}),
      recommended_route: route.evictionRoute,
    },
    __meta: {
      ...(facts.__meta || {}),
      case_id: caseId,
      jurisdiction,
      product,
      product_tier: product,
      selected_notice_route: route.selectedNoticeRoute,
    },
  };
}
