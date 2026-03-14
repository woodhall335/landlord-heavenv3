import { isResidentialLettingProductSku } from '@/lib/residential-letting/products';

export function isResidentialStandaloneTenancyProduct(product: string | null | undefined): boolean {
  return isResidentialLettingProductSku(product ?? null);
}

