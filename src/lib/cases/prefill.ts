import type { ProductSku } from '@/lib/pricing/products';

export type PrefillProduct = ProductSku;

export interface PrefillFieldMapping {
  sourceKey: string;
  destinationKey: string;
  requiresReview: boolean;
}

export interface PrefillResult {
  destinationFacts: Record<string, unknown>;
  mappedFields: string[];
}

export interface BuildPrefilledFactsInput {
  sourceCaseId: string;
  sourceProduct: PrefillProduct;
  destinationProduct: PrefillProduct;
  prefillTrigger: string;
  sourceFacts: Record<string, unknown>;
}

const COMMON_PARTY_AND_TENANCY_MAPPINGS: PrefillFieldMapping[] = [
  { sourceKey: 'landlord_name', destinationKey: 'landlord_name', requiresReview: true },
  { sourceKey: 'landlordName', destinationKey: 'landlord_name', requiresReview: true },
  { sourceKey: 'landlord_address', destinationKey: 'landlord_address', requiresReview: true },
  { sourceKey: 'landlordAddress', destinationKey: 'landlord_address', requiresReview: true },
  { sourceKey: 'landlord_email', destinationKey: 'landlord_email', requiresReview: true },
  { sourceKey: 'landlordEmail', destinationKey: 'landlord_email', requiresReview: true },
  { sourceKey: 'landlord_phone', destinationKey: 'landlord_phone', requiresReview: true },
  { sourceKey: 'landlordPhone', destinationKey: 'landlord_phone', requiresReview: true },
  { sourceKey: 'tenant_name', destinationKey: 'tenant_name', requiresReview: true },
  { sourceKey: 'tenantName', destinationKey: 'tenant_name', requiresReview: true },
  { sourceKey: 'tenant_names', destinationKey: 'tenant_names', requiresReview: true },
  { sourceKey: 'property_address', destinationKey: 'property_address', requiresReview: true },
  { sourceKey: 'propertyAddress', destinationKey: 'property_address', requiresReview: true },
  { sourceKey: 'tenancy_start_date', destinationKey: 'tenancy_start_date', requiresReview: true },
  { sourceKey: 'tenancyStartDate', destinationKey: 'tenancy_start_date', requiresReview: true },
  { sourceKey: 'rent_amount', destinationKey: 'rent_amount', requiresReview: true },
  { sourceKey: 'rentAmount', destinationKey: 'rent_amount', requiresReview: true },
  { sourceKey: 'rent_frequency', destinationKey: 'rent_frequency', requiresReview: true },
  { sourceKey: 'rentFrequency', destinationKey: 'rent_frequency', requiresReview: true },
  { sourceKey: 'rent_due_day', destinationKey: 'rent_due_day', requiresReview: true },
  { sourceKey: 'rentDueDay', destinationKey: 'rent_due_day', requiresReview: true },
  { sourceKey: 'deposit_amount', destinationKey: 'deposit_amount', requiresReview: true },
  { sourceKey: 'depositAmount', destinationKey: 'deposit_amount', requiresReview: true },
];

const ARREARS_MAPPINGS: PrefillFieldMapping[] = [
  { sourceKey: 'arrears_schedule_rows', destinationKey: 'arrears_schedule_rows', requiresReview: true },
  { sourceKey: 'arrearsScheduleRows', destinationKey: 'arrears_schedule_rows', requiresReview: true },
  { sourceKey: 'total_arrears_amount', destinationKey: 'total_arrears_amount', requiresReview: true },
  { sourceKey: 'totalArrearsAmount', destinationKey: 'total_arrears_amount', requiresReview: true },
  { sourceKey: 'arrears_start_date', destinationKey: 'arrears_start_date', requiresReview: true },
  { sourceKey: 'arrearsStartDate', destinationKey: 'arrears_start_date', requiresReview: true },
  { sourceKey: 'previous_contact_attempts', destinationKey: 'previous_contact_attempts', requiresReview: true },
  { sourceKey: 'previousContactAttempts', destinationKey: 'previous_contact_attempts', requiresReview: true },
  { sourceKey: 'payment_plan_offered', destinationKey: 'payment_plan_offered', requiresReview: true },
  { sourceKey: 'paymentPlanOffered', destinationKey: 'payment_plan_offered', requiresReview: true },
];

const EVICTION_ROUTE_MAPPINGS: PrefillFieldMapping[] = [
  { sourceKey: 'selected_notice_route', destinationKey: 'selected_notice_route', requiresReview: true },
  { sourceKey: 'eviction_route', destinationKey: 'eviction_route', requiresReview: true },
  { sourceKey: 'section8_grounds', destinationKey: 'section8_grounds', requiresReview: true },
  { sourceKey: 'selected_section8_grounds', destinationKey: 'selected_section8_grounds', requiresReview: true },
  { sourceKey: 'notice_service_details', destinationKey: 'notice_service_details', requiresReview: true },
  { sourceKey: 'notice_served_date', destinationKey: 'notice_served_date', requiresReview: true },
];

const MONEY_CLAIM_OUTCOME_MAPPINGS: PrefillFieldMapping[] = [
  { sourceKey: 'court_order_date', destinationKey: 'possession_order_date', requiresReview: true },
  { sourceKey: 'judgment_amount', destinationKey: 'existing_judgment_amount', requiresReview: true },
  { sourceKey: 'total_debt', destinationKey: 'total_debt', requiresReview: true },
];

function getByPath(source: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((current, part) => {
    if (!current || typeof current !== 'object' || Array.isArray(current)) {
      return undefined;
    }
    return (current as Record<string, unknown>)[part];
  }, source);
}

function applyMappings(
  mappings: PrefillFieldMapping[],
  sourceFacts: Record<string, unknown>,
  destinationFacts: Record<string, unknown>,
  mappedFields: string[],
) {
  for (const mapping of mappings) {
    const sourceValue = getByPath(sourceFacts, mapping.sourceKey);
    if (sourceValue === undefined || sourceValue === null || sourceValue === '') {
      continue;
    }

    destinationFacts[mapping.destinationKey] = sourceValue;
    mappedFields.push(`${mapping.sourceKey}->${mapping.destinationKey}`);
  }
}

function routeDefaults(destinationProduct: PrefillProduct): Record<string, unknown> {
  if (destinationProduct === 'notice_only' || destinationProduct === 'complete_pack') {
    return {
      property_country: 'england',
      jurisdiction: 'england',
      selected_notice_route: 'section_8',
      eviction_route: 'section_8',
    };
  }

  return {
    property_country: 'england',
    jurisdiction: 'england',
  };
}

export function getPrefillMappings(
  sourceProduct: PrefillProduct,
  destinationProduct: PrefillProduct,
): PrefillFieldMapping[] {
  if (sourceProduct === 'notice_only' && destinationProduct === 'complete_pack') {
    return [...COMMON_PARTY_AND_TENANCY_MAPPINGS, ...ARREARS_MAPPINGS, ...EVICTION_ROUTE_MAPPINGS];
  }

  if (sourceProduct === 'complete_pack' && destinationProduct === 'money_claim') {
    return [...COMMON_PARTY_AND_TENANCY_MAPPINGS, ...ARREARS_MAPPINGS, ...MONEY_CLAIM_OUTCOME_MAPPINGS];
  }

  return [];
}

export function mapFactsForRelatedProduct(
  sourceProduct: PrefillProduct,
  destinationProduct: PrefillProduct,
  sourceFacts: Record<string, unknown>,
): PrefillResult {
  const destinationFacts: Record<string, unknown> = {
    ...routeDefaults(destinationProduct),
  };
  const mappedFields: string[] = [];

  applyMappings(
    getPrefillMappings(sourceProduct, destinationProduct),
    sourceFacts,
    destinationFacts,
    mappedFields,
  );

  return { destinationFacts, mappedFields };
}

export function buildPrefilledFacts(input: BuildPrefilledFactsInput): PrefillResult {
  const { destinationFacts, mappedFields } = mapFactsForRelatedProduct(
    input.sourceProduct,
    input.destinationProduct,
    input.sourceFacts,
  );

  return {
    destinationFacts: {
      ...destinationFacts,
      __meta: {
        ...((input.sourceFacts.__meta || {}) as Record<string, unknown>),
        product: input.destinationProduct,
        source_case_id: input.sourceCaseId,
        source_product: input.sourceProduct,
        destination_product: input.destinationProduct,
        prefill_trigger: input.prefillTrigger,
        mapped_fields: mappedFields,
        requires_review: true,
      },
    },
    mappedFields,
  };
}
