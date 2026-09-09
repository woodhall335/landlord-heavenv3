import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (...parts: string[]) => fs.readFileSync(path.join(process.cwd(), ...parts), 'utf8');

describe('Universal Hero proof contract', () => {
  it('keeps the original rating pill and the live daily usage counter on every Universal Hero', () => {
    const hero = read('src', 'components', 'landing', 'UniversalHero.tsx');

    expect(hero).toContain('const shouldShowReviewPill = true');
    expect(hero).toContain('const shouldShowUsageCounter = true');
    expect(hero).toContain("const REVIEW_STARS = '\\u2605\\u2605\\u2605\\u2605\\u2605'");
    expect(hero).toContain('getDynamicReviewCount()');
    expect(hero).toContain('{REVIEW_RATING}/5 | {reviewCount} reviews');
    expect(hero).toContain('<UsageTodayCounter />');
  });

  it('restores the original browser-persistent daily counter capped at 500', () => {
    const counter = read('src', 'components', 'ui', 'SocialProofCounter.tsx');

    expect(counter).toContain('dailyGrowth: 500');
    expect(counter).toContain("text: 'landlords have used Landlord Heaven today'");
    expect(counter).toContain('getPersistedCount');
    expect(counter).toContain('Math.min(timeBasedCount + initialVariance, maxCount)');
    expect(counter).toContain('Math.max(count, nextCount)');
    expect(counter).toContain('sessionStorage.getItem(animationKey)');
  });
});
