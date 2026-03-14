import {
  isResidentialLettingProductSku,
  type ResidentialLettingProductSku,
} from '@/lib/residential-letting/products';

export function isResidentialStandaloneTenancyProduct(
  product: string | null | undefined
): product is ResidentialLettingProductSku {
  return isResidentialLettingProductSku(product ?? null);
}

