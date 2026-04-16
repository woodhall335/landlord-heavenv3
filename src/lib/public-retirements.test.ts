import { describe, expect, it } from 'vitest';
import {
  getRetiredPublicRouteRedirect,
  isRetiredPublicRoute,
} from './public-retirements';

describe('public-retirements', () => {
  it('redirects retired public non-England eviction routes into the England notice owner', () => {
    expect(isRetiredPublicRoute('/wales-eviction-notices')).toBe(true);
    expect(isRetiredPublicRoute('/scotland-eviction-notices')).toBe(true);
    expect(isRetiredPublicRoute('/eviction-process-wales')).toBe(true);
    expect(isRetiredPublicRoute('/eviction-process-scotland')).toBe(true);

    expect(getRetiredPublicRouteRedirect('/wales-eviction-notices')).toBe('/products/notice-only');
    expect(getRetiredPublicRouteRedirect('/scotland-eviction-notices')).toBe('/products/notice-only');
  });

  it('redirects retired public non-England tenancy routes into the England tenancy hub', () => {
    expect(getRetiredPublicRouteRedirect('/wales-tenancy-agreement-template')).toBe('/products/ast');
    expect(getRetiredPublicRouteRedirect('/private-residential-tenancy-agreement-template')).toBe('/products/ast');
    expect(getRetiredPublicRouteRedirect('/northern-ireland-tenancy-agreement-template')).toBe('/products/ast');
    expect(getRetiredPublicRouteRedirect('/notice-to-quit-northern-ireland-guide')).toBe('/products/ast');
  });
});
