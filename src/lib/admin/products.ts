import { PRODUCTS, type ProductSku } from '@/lib/pricing/products';

export type AdminProductOption = {
  value: ProductSku;
  label: string;
};

export const ADMIN_PRODUCT_OPTIONS: AdminProductOption[] = [
  { value: 'notice_only', label: PRODUCTS.notice_only.label },
  { value: 'complete_pack', label: PRODUCTS.complete_pack.label },
  { value: 'money_claim', label: PRODUCTS.money_claim.label },
  { value: 'section13_standard', label: PRODUCTS.section13_standard.label },
  { value: 'section13_defensive', label: PRODUCTS.section13_defensive.label },
  { value: 'ast_standard', label: PRODUCTS.ast_standard.label },
  { value: 'ast_premium', label: PRODUCTS.ast_premium.label },
  {
    value: 'england_standard_tenancy_agreement',
    label: PRODUCTS.england_standard_tenancy_agreement.label,
  },
  {
    value: 'england_premium_tenancy_agreement',
    label: PRODUCTS.england_premium_tenancy_agreement.label,
  },
  {
    value: 'england_student_tenancy_agreement',
    label: PRODUCTS.england_student_tenancy_agreement.label,
  },
  {
    value: 'england_hmo_shared_house_tenancy_agreement',
    label: PRODUCTS.england_hmo_shared_house_tenancy_agreement.label,
  },
  { value: 'england_lodger_agreement', label: PRODUCTS.england_lodger_agreement.label },
  { value: 'residential_tenancy_application', label: PRODUCTS.residential_tenancy_application.label },
];

const ADMIN_PRODUCT_NAME_BY_SKU = new Map(
  ADMIN_PRODUCT_OPTIONS.map((option) => [option.value, option.label])
);

export function getAdminProductLabel(productType: string | null | undefined): string {
  if (!productType) return 'Unknown';
  return ADMIN_PRODUCT_NAME_BY_SKU.get(productType as ProductSku) || productType;
}
