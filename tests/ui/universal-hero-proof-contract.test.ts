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

  it('uses first-party aggregate sessions and does not display an invented fallback number', () => {
    const counter = read('src', 'components', 'ui', 'SocialProofCounter.tsx');
    const endpoint = read('src', 'app', 'api', 'public', 'usage-today', 'route.ts');
    const tracker = read('src', 'components', 'analytics', 'OrganicLandingTracker.tsx');

    expect(counter).toContain("fetch('/api/public/usage-today'");
    expect(counter).toContain('Live landlord usage updates throughout the day');
    expect(endpoint).toContain("basis: 'distinct_first_party_sessions'");
    expect(endpoint).toContain(".eq('event_name', 'site_visit')");
    expect(tracker).toContain("recordMarketingGrowthEvent('site_visit'");
    expect(counter).not.toMatch(/baseNumber\s*[+*-]|Math\.random/);
  });
});
