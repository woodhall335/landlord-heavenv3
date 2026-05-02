export const ENGLAND_MODERN_TENANCY_PRODUCTS = [
  'england_standard_tenancy_agreement',
  'england_premium_tenancy_agreement',
  'england_student_tenancy_agreement',
  'england_hmo_shared_house_tenancy_agreement',
  'england_lodger_agreement',
] as const;

export type EnglandModernTenancyProductSku =
  (typeof ENGLAND_MODERN_TENANCY_PRODUCTS)[number];

export interface EnglandTenancyProductImage {
  src: string;
  alt: string;
}

export const ENGLAND_TENANCY_PRODUCT_IMAGES = {
  england_standard_tenancy_agreement: {
    src: '/images/standard_tenancy.webp',
    alt: 'Standard Tenancy Agreement document preview',
  },
  england_premium_tenancy_agreement: {
    src: '/images/premium_tenancy.webp',
    alt: 'Premium Tenancy Agreement document preview',
  },
  england_student_tenancy_agreement: {
    src: '/images/student_tenency.webp',
    alt: 'Student Tenancy Agreement document preview',
  },
  england_hmo_shared_house_tenancy_agreement: {
    src: '/images/hmo_tenency_agreement.webp',
    alt: 'HMO / Shared House Tenancy Agreement document preview',
  },
  england_lodger_agreement: {
    src: '/images/room_let_agreement.webp',
    alt: 'Room Let / Lodger Agreement & Shared Home Pack document preview',
  },
} as const satisfies Record<EnglandModernTenancyProductSku, EnglandTenancyProductImage>;

export const ENGLAND_LEGACY_TENANCY_ALIAS_MAP = {
  ast_standard: 'england_standard_tenancy_agreement',
  ast_premium: 'england_premium_tenancy_agreement',
} as const satisfies Record<string, EnglandModernTenancyProductSku>;

export type EnglandLegacyTenancyAliasSku =
  keyof typeof ENGLAND_LEGACY_TENANCY_ALIAS_MAP;

export function isEnglandModernTenancyProductSku(
  value: string | null | undefined
): value is EnglandModernTenancyProductSku {
  return Boolean(
    value &&
      (ENGLAND_MODERN_TENANCY_PRODUCTS as readonly string[]).includes(value)
  );
}

export function isEnglandLegacyTenancyAliasSku(
  value: string | null | undefined
): value is EnglandLegacyTenancyAliasSku {
  return Boolean(value && value in ENGLAND_LEGACY_TENANCY_ALIAS_MAP);
}

export function getEnglandCanonicalTenancyProduct(
  value: string | null | undefined
): EnglandModernTenancyProductSku | null {
  if (isEnglandModernTenancyProductSku(value)) {
    return value;
  }

  if (isEnglandLegacyTenancyAliasSku(value)) {
    return ENGLAND_LEGACY_TENANCY_ALIAS_MAP[value];
  }

  return null;
}

export function isEnglandTenancyChooserProduct(
  value: string | null | undefined
): boolean {
  return value === 'tenancy_agreement';
}

export const ENGLAND_TENANCY_PRODUCT_ORDER: EnglandModernTenancyProductSku[] = [
  'england_standard_tenancy_agreement',
  'england_premium_tenancy_agreement',
  'england_student_tenancy_agreement',
  'england_hmo_shared_house_tenancy_agreement',
  'england_lodger_agreement',
];

export function isEnglandTenancyProductOrAlias(
  value: string | null | undefined
): boolean {
  return isEnglandModernTenancyProductSku(value) || isEnglandLegacyTenancyAliasSku(value);
}

export function getEnglandTenancyProductLabel(
  value: string | null | undefined
): string {
  switch (getEnglandCanonicalTenancyProduct(value) ?? value) {
    case 'england_standard_tenancy_agreement':
      return 'Standard Tenancy Agreement & Setup Pack';
    case 'england_premium_tenancy_agreement':
      return 'Premium Tenancy Agreement & Management Pack';
    case 'england_student_tenancy_agreement':
      return 'Student Tenancy Agreement';
    case 'england_hmo_shared_house_tenancy_agreement':
      return 'HMO / Shared House Tenancy Agreement & House Management Pack';
    case 'england_lodger_agreement':
      return 'Room Let / Lodger Agreement & Shared Home Pack';
    default:
      return 'England Tenancy Agreement';
  }
}
