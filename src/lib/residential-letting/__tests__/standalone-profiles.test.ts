import { describe, expect, it } from 'vitest';

import {
  getPublicResidentialStandaloneProfiles,
  getResidentialStandaloneProfile,
} from '@/lib/residential-letting/standalone-profiles';

describe('standalone profiles', () => {
  it('defines premium landing and review content for all public standalone products', () => {
    const profiles = getPublicResidentialStandaloneProfiles();

    expect(profiles).toHaveLength(10);

    profiles.forEach((profile) => {
      expect(profile.icon).toContain('/images/wizard-icons/');
      expect(profile.heroBullets.length).toBeGreaterThanOrEqual(3);
      expect(profile.reviewHighlights.length).toBeGreaterThanOrEqual(3);
      expect(profile.outputSections.length).toBeGreaterThanOrEqual(4);
      expect(profile.faqs.length).toBeGreaterThanOrEqual(5);
      expect(profile.documentPreviewAnatomy.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('surfaces caution messaging for legally sensitive products', () => {
    const arrears = getResidentialStandaloneProfile('rent_arrears_letter');
    const renewal = getResidentialStandaloneProfile('renewal_tenancy_agreement');

    expect(arrears.cautionBanner?.title).toBeTruthy();
    expect(renewal.cautionBanner?.body).toContain('1 May 2026');
  });
});
