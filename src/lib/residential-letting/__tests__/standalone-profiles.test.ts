import { describe, expect, it } from 'vitest';

import {
  getPublicResidentialStandaloneProfiles,
  getResidentialStandaloneProfile,
} from '@/lib/residential-letting/standalone-profiles';

describe('standalone profiles', () => {
  it('defines landing and review content for all public standalone products', () => {
    const profiles = getPublicResidentialStandaloneProfiles();

    expect(profiles).toHaveLength(10);

    profiles.forEach((profile) => {
      expect(profile.icon).toContain('/images/wizard-icons/');
      expect(profile.heroBullets.length).toBeGreaterThanOrEqual(3);
      expect(profile.reviewHighlights.length).toBeGreaterThanOrEqual(3);
      expect(profile.outputSections.length).toBeGreaterThanOrEqual(4);
      expect(profile.trustModules.length).toBeGreaterThanOrEqual(3);
      expect(profile.theme.accent).toBeTruthy();
      expect(profile.landing.faqs.length).toBeGreaterThanOrEqual(5);
      expect(profile.landing.documentPreviewAnatomy.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('keeps public landing copy free from premium-heavy wording', () => {
    const profiles = getPublicResidentialStandaloneProfiles();

    profiles.forEach((profile) => {
      expect(profile.landing.title).not.toMatch(/\bpremium\b/i);
      expect(profile.landing.h1).not.toMatch(/\bpremium\b/i);
      expect(profile.landing.description).not.toMatch(/\bpremium\b/i);
    });
  });

  it('surfaces caution messaging for legally sensitive products', () => {
    const arrears = getResidentialStandaloneProfile('rent_arrears_letter');
    const renewal = getResidentialStandaloneProfile('renewal_tenancy_agreement');

    expect(arrears.cautionBanner?.title).toBeTruthy();
    expect(renewal.cautionBanner?.body).toContain('1 May 2026');
  });
});
