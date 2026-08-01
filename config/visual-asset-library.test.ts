import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { MARKETING_ILLUSTRATIONS } from './marketing-illustrations';
import {
  UNIVERSAL_HERO_LIBRARY,
  UNIVERSAL_HERO_POLISH_CONTRACT,
  findUniversalHeroForPath,
} from './universal-hero-library';
import { UNIVERSAL_HERO_IMAGES, getUniversalHeroImageForPath } from './universal-hero-images';

function flattenIllustrations(value: unknown): Array<{ src: string; alt: string }> {
  if (!value || typeof value !== 'object') return [];
  if ('src' in value && 'alt' in value) return [value as { src: string; alt: string }];
  return Object.values(value).flatMap(flattenIllustrations);
}

describe('visual asset library', () => {
  it('keeps every registered illustration on disk with useful alt text', () => {
    const illustrations = flattenIllustrations(MARKETING_ILLUSTRATIONS);
    expect(illustrations).toHaveLength(66);

    for (const item of illustrations) {
      expect(item.alt.length).toBeGreaterThan(12);
      expect(fs.existsSync(path.join(process.cwd(), 'public', item.src))).toBe(true);
    }
  });

  it('keeps all universal watercolor heroes available', () => {
    const heroes = Object.values(UNIVERSAL_HERO_IMAGES);
    expect(heroes).toHaveLength(16);
    for (const src of heroes) {
      expect(fs.existsSync(path.join(process.cwd(), 'public', src))).toBe(true);
    }
  });

  it('keeps the 50-page follow-up hero library available and text-safe', () => {
    expect(UNIVERSAL_HERO_LIBRARY).toHaveLength(50);
    expect(new Set(UNIVERSAL_HERO_LIBRARY.map((entry) => entry.key)).size).toBe(50);

    for (const entry of UNIVERSAL_HERO_LIBRARY) {
      expect(entry.alt.length).toBeGreaterThan(18);
      expect(entry.routeSuggestions.length).toBeGreaterThan(0);
      expect(fs.existsSync(path.join(process.cwd(), 'public', entry.src))).toBe(true);
    }

    expect(UNIVERSAL_HERO_POLISH_CONTRACT.desktopMinimumHeight).toBe('100dvh');
    expect(UNIVERSAL_HERO_POLISH_CONTRACT.desktopCopyAreaPercent).toBe(50);
    expect(UNIVERSAL_HERO_POLISH_CONTRACT.preserveUsageCounter).toBe(true);
  });

  it('resolves representative product, policy and guide routes from the follow-up library', () => {
    expect(findUniversalHeroForPath('/products/complete-pack')?.key).toBe('completeEvictionPack');
    expect(findUniversalHeroForPath('/privacy')?.key).toBe('privacy');
    expect(findUniversalHeroForPath('/section-8-grounds-explained')?.key).toBe('section8Grounds');
    expect(findUniversalHeroForPath('/tenancy-agreements/scotland')?.key).toBe('tenancyScotland');
  });

  it('covers every route named for the future site-wide polish pass', () => {
    const requestedRoutes = [
      '/products/complete-pack',
      '/products/money-claim',
      '/assisted-prep',
      '/rent-increase',
      '/pricing',
      '/standard-tenancy-agreement',
      '/products/ast',
      '/tenancy-agreements/wales',
      '/tenancy-agreements/scotland',
      '/tenancy-agreements/northern-ireland',
      '/premium-tenancy-agreement',
      '/blog',
      '/eviction-guides',
      '/tools',
      '/samples',
      '/section-8-notice',
      '/ask-heaven',
      '/about',
      '/contact',
      '/help',
      '/terms',
      '/privacy',
      '/cookies',
      '/refunds',
    ];

    for (const route of requestedRoutes) {
      expect(findUniversalHeroForPath(route), route).toBeDefined();
    }
  });

  it('keeps a dedicated pricing-card image set for every product and assisted service', () => {
    const pricingCardDirectory = path.join(
      process.cwd(),
      'public',
      'images',
      'illustrations',
      'pricing-cards'
    );
    expect(fs.readdirSync(pricingCardDirectory).filter((file) => file.endsWith('.webp'))).toHaveLength(16);
  });

  it('routes jurisdiction and high-intent families to the intended hero', () => {
    expect(getUniversalHeroImageForPath('/tenancy-agreements/wales')).toContain('hero-tenancy-wales');
    expect(getUniversalHeroImageForPath('/tenancy-agreements/scotland')).toContain('hero-tenancy-scotland');
    expect(getUniversalHeroImageForPath('/tenancy-agreements/northern-ireland')).toContain('hero-tenancy-northern-ireland');
    expect(getUniversalHeroImageForPath('/tenant-not-paying-rent')).toContain('hero-high-intent-tenant-not-paying');
  });
});
