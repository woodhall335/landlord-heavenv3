import { SITE_ORIGIN } from '@/lib/seo/urls';
import type { Section13ProductSku } from './types';

export function buildSection13WizardHrefWithRentCheckerToken(
  product: Section13ProductSku,
  token: string,
  source = 'rent_checker_email'
): string {
  const url = new URL('/wizard/flow', SITE_ORIGIN);
  url.searchParams.set('type', 'rent_increase');
  url.searchParams.set('jurisdiction', 'england');
  url.searchParams.set('product', product);
  url.searchParams.set('src', source);
  url.searchParams.set('rent_checker_token', token);
  return url.toString();
}
