import { isResidentialLettingProductSku } from '@/lib/residential-letting/products';

const MODERN_ENGLAND_ASSURED_PRODUCTS = new Set([
  'england_standard_tenancy_agreement',
  'england_premium_tenancy_agreement',
  'england_student_tenancy_agreement',
  'england_hmo_shared_house_tenancy_agreement',
]);

export interface AgreementSuitabilityFacts {
  tenantIsIndividual?: boolean;
  mainHome?: boolean;
  landlordLivesAtProperty?: boolean;
  holidayOrLicence?: boolean;
}

interface AgreementSuitabilityOptions {
  product?: string | null;
}

function coerceBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === 'yes' || normalized === '1') return true;
    if (normalized === 'false' || normalized === 'no' || normalized === '0') return false;
  }
  if (typeof value === 'number') return value > 0;
  return undefined;
}

function getValueAtPath(facts: Record<string, any>, path: string): unknown {
  return path
    .split('.')
    .filter(Boolean)
    .reduce((current: unknown, key) => {
      if (current === undefined || current === null || typeof current !== 'object') {
        return undefined;
      }
      return (current as Record<string, any>)[key];
    }, facts);
}

function firstDefined<T>(...values: Array<T | undefined>): T | undefined {
  return values.find((value) => value !== undefined);
}

function detectProductHint(
  facts: Record<string, any>,
  explicitProduct?: string | null,
): string | undefined {
  const candidates = [
    explicitProduct,
    facts.product,
    facts.canonical_product,
    facts.original_product,
    facts.__meta?.product,
    facts.__meta?.canonical_product,
    facts.__meta?.original_product,
  ];

  return candidates.find(
    (candidate): candidate is string => typeof candidate === 'string' && candidate.trim().length > 0,
  );
}

function isModernEnglandAssuredProduct(
  facts: Record<string, any>,
  explicitProduct?: string | null,
): boolean {
  const product = detectProductHint(facts, explicitProduct);
  return Boolean(product && isResidentialLettingProductSku(product) && MODERN_ENGLAND_ASSURED_PRODUCTS.has(product));
}

export function getAgreementSuitabilityFacts(
  facts: Record<string, any>,
  options?: AgreementSuitabilityOptions,
): AgreementSuitabilityFacts {
  const modernEnglandAssuredProduct = isModernEnglandAssuredProduct(facts, options?.product);

  const tenantIsIndividual = firstDefined(
    coerceBoolean(facts.tenant_is_individual),
    coerceBoolean(getValueAtPath(facts, 'tenancy.ast_suitability.tenant_is_individual')),
  );

  const mainHome = firstDefined(
    coerceBoolean(facts.main_home),
    coerceBoolean(getValueAtPath(facts, 'tenancy.ast_suitability.main_home')),
  );

  const legacyLandlordLivesAtProperty = coerceBoolean(facts.landlord_lives_at_property);
  const nestedLandlordLivesAtProperty = coerceBoolean(
    getValueAtPath(facts, 'tenancy.ast_suitability.landlord_lives_at_property'),
  );
  const landlordNotResidentConfirmed = coerceBoolean(facts.landlord_not_resident_confirmed);

  const landlordLivesAtProperty = firstDefined(
    landlordNotResidentConfirmed === undefined ? undefined : !landlordNotResidentConfirmed,
    modernEnglandAssuredProduct && legacyLandlordLivesAtProperty !== undefined
      ? !legacyLandlordLivesAtProperty
      : undefined,
    nestedLandlordLivesAtProperty,
    !modernEnglandAssuredProduct ? legacyLandlordLivesAtProperty : undefined,
  );

  const legacyHolidayOrLicence = coerceBoolean(facts.holiday_or_licence);
  const nestedHolidayOrLicence = coerceBoolean(
    getValueAtPath(facts, 'tenancy.ast_suitability.holiday_or_licence'),
  );
  const notHolidayOrLicenceConfirmed = coerceBoolean(facts.not_holiday_or_licence_confirmed);

  const holidayOrLicence = firstDefined(
    notHolidayOrLicenceConfirmed === undefined ? undefined : !notHolidayOrLicenceConfirmed,
    modernEnglandAssuredProduct && legacyHolidayOrLicence !== undefined
      ? !legacyHolidayOrLicence
      : undefined,
    nestedHolidayOrLicence,
    !modernEnglandAssuredProduct ? legacyHolidayOrLicence : undefined,
  );

  return {
    tenantIsIndividual,
    mainHome,
    landlordLivesAtProperty,
    holidayOrLicence,
  };
}

export function getEnglandAssuredSuitabilityAnswer(
  facts: Record<string, any>,
  options?: AgreementSuitabilityOptions,
): Record<string, boolean> {
  const suitability = getAgreementSuitabilityFacts(facts, options);
  const answer: Record<string, boolean> = {};

  if (suitability.tenantIsIndividual !== undefined) {
    answer.tenant_is_individual = suitability.tenantIsIndividual;
  }
  if (suitability.mainHome !== undefined) {
    answer.main_home = suitability.mainHome;
  }
  if (suitability.landlordLivesAtProperty !== undefined) {
    answer.landlord_not_resident_confirmed = !suitability.landlordLivesAtProperty;
  }
  if (suitability.holidayOrLicence !== undefined) {
    answer.not_holiday_or_licence_confirmed = !suitability.holidayOrLicence;
  }

  return answer;
}

export function getAgreementSuitabilityWarnings(
  facts: Record<string, any>,
  options?: AgreementSuitabilityOptions,
): string[] {
  const suitability = getAgreementSuitabilityFacts(facts, options);
  const warnings: string[] = [];

  if (suitability.tenantIsIndividual === false) {
    warnings.push('Tenant must be an individual (not a company) for this tenancy agreement route');
  }
  if (suitability.mainHome === false) {
    warnings.push("Property must be the tenant's main home for this tenancy agreement route");
  }
  if (suitability.landlordLivesAtProperty === true) {
    warnings.push(
      'If landlord lives at property, this is likely a lodger/licence arrangement, not this tenancy agreement route',
    );
  }
  if (suitability.holidayOrLicence === true) {
    warnings.push('Holiday lets and licence arrangements are not covered by this tenancy agreement route');
  }

  return warnings;
}
