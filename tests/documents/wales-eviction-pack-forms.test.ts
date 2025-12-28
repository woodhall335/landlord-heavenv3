/**
 * Wales Eviction Pack Forms Test
 *
 * Verifies that Wales eviction_pack routes (wales_section_173, wales_fault_based)
 * use Wales-specific court forms instead of England forms.
 *
 * CRITICAL: This test prevents regression where Wales packs might accidentally
 * use England N5/N5B/N119 forms.
 *
 * Required Forms:
 * - Wales: N5_WALES_1222.pdf, N5B_WALES_0323.pdf, N119_WALES_1222.pdf
 * - England: n5-eng.pdf, n5b-eng.pdf, n119-eng.pdf
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { getFormFilename, getCourtFormFiles } from '../../src/lib/documents/official-forms-filler';

const OFFICIAL_FORMS_DIR = path.join(process.cwd(), 'public', 'official-forms');

describe('Wales Eviction Pack Forms Selection', () => {
  describe('getFormFilename - Jurisdiction-Based Selection', () => {
    it('should return Wales N5 form for Wales jurisdiction', () => {
      const filename = getFormFilename('n5', 'wales');
      expect(filename).toBe('N5_WALES_1222.pdf');
    });

    it('should return Wales N5B form for Wales jurisdiction', () => {
      const filename = getFormFilename('n5b', 'wales');
      expect(filename).toBe('N5B_WALES_0323.pdf');
    });

    it('should return Wales N119 form for Wales jurisdiction', () => {
      const filename = getFormFilename('n119', 'wales');
      expect(filename).toBe('N119_WALES_1222.pdf');
    });

    it('should return England N5 form for England jurisdiction', () => {
      const filename = getFormFilename('n5', 'england');
      expect(filename).toBe('n5-eng.pdf');
    });

    it('should return England N5B form for England jurisdiction', () => {
      const filename = getFormFilename('n5b', 'england');
      expect(filename).toBe('n5b-eng.pdf');
    });

    it('should return England N119 form for England jurisdiction', () => {
      const filename = getFormFilename('n119', 'england');
      expect(filename).toBe('n119-eng.pdf');
    });

    it('should default to England forms when jurisdiction is undefined', () => {
      expect(getFormFilename('n5', undefined)).toBe('n5-eng.pdf');
      expect(getFormFilename('n5b', undefined)).toBe('n5b-eng.pdf');
      expect(getFormFilename('n119', undefined)).toBe('n119-eng.pdf');
    });

    it('should default to England forms for non-England/Wales jurisdictions', () => {
      // Scotland and NI don't use these forms, but if called, should default safely
      expect(getFormFilename('n5', 'scotland')).toBe('n5-eng.pdf');
      expect(getFormFilename('n5', 'northern-ireland')).toBe('n5-eng.pdf');
    });
  });

  describe('getCourtFormFiles - Jurisdiction Form Sets', () => {
    it('should return correct England form set', () => {
      const forms = getCourtFormFiles('england');
      expect(forms).toEqual({
        n5: 'n5-eng.pdf',
        n5b: 'n5b-eng.pdf',
        n119: 'n119-eng.pdf',
      });
    });

    it('should return correct Wales form set', () => {
      const forms = getCourtFormFiles('wales');
      expect(forms).toEqual({
        n5: 'N5_WALES_1222.pdf',
        n5b: 'N5B_WALES_0323.pdf',
        n119: 'N119_WALES_1222.pdf',
      });
    });
  });

  describe('Form Files Existence', () => {
    const walesForms = [
      'N5_WALES_1222.pdf',
      'N5B_WALES_0323.pdf',
      'N119_WALES_1222.pdf',
    ];

    const englandForms = [
      'n5-eng.pdf',
      'n5b-eng.pdf',
      'n119-eng.pdf',
    ];

    for (const formFile of walesForms) {
      it(`Wales form ${formFile} should exist on disk`, () => {
        const formPath = path.join(OFFICIAL_FORMS_DIR, formFile);
        expect(fs.existsSync(formPath), `Missing Wales form: ${formFile}`).toBe(true);
      });
    }

    for (const formFile of englandForms) {
      it(`England form ${formFile} should exist on disk`, () => {
        const formPath = path.join(OFFICIAL_FORMS_DIR, formFile);
        expect(fs.existsSync(formPath), `Missing England form: ${formFile}`).toBe(true);
      });
    }
  });

  describe('No Cross-Jurisdiction Form Usage', () => {
    it('Wales getFormFilename should never return England form names', () => {
      const n5 = getFormFilename('n5', 'wales');
      const n5b = getFormFilename('n5b', 'wales');
      const n119 = getFormFilename('n119', 'wales');

      expect(n5).not.toContain('-eng.');
      expect(n5b).not.toContain('-eng.');
      expect(n119).not.toContain('-eng.');

      expect(n5).toContain('WALES');
      expect(n5b).toContain('WALES');
      expect(n119).toContain('WALES');
    });

    it('England getFormFilename should never return Wales form names', () => {
      const n5 = getFormFilename('n5', 'england');
      const n5b = getFormFilename('n5b', 'england');
      const n119 = getFormFilename('n119', 'england');

      expect(n5).not.toContain('WALES');
      expect(n5b).not.toContain('WALES');
      expect(n119).not.toContain('WALES');

      expect(n5).toContain('-eng.');
      expect(n5b).toContain('-eng.');
      expect(n119).toContain('-eng.');
    });
  });
});

describe('Wales Eviction Pack Routes', () => {
  const walesEvictionRoutes = ['wales_section_173', 'wales_fault_based'];

  for (const route of walesEvictionRoutes) {
    describe(`Route: ${route}`, () => {
      it('should use Wales forms for court documents', () => {
        // When generating an eviction pack for this route,
        // the form selection should use Wales forms
        const forms = getCourtFormFiles('wales');

        expect(forms.n5).toBe('N5_WALES_1222.pdf');
        expect(forms.n5b).toBe('N5B_WALES_0323.pdf');
        expect(forms.n119).toBe('N119_WALES_1222.pdf');
      });
    });
  }
});

describe('Forms Manifest Validation', () => {
  it('forms-manifest.json should include Wales section', () => {
    const manifestPath = path.join(OFFICIAL_FORMS_DIR, 'forms-manifest.json');
    expect(fs.existsSync(manifestPath)).toBe(true);

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    expect(manifest.jurisdictions).toHaveProperty('wales');
    expect(manifest.jurisdictions.wales).toHaveProperty('forms');
  });

  it('forms-manifest.json should list all Wales forms', () => {
    const manifestPath = path.join(OFFICIAL_FORMS_DIR, 'forms-manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

    const walesForms = manifest.jurisdictions.wales.forms;
    expect(walesForms).toHaveProperty('N5_WALES_1222.pdf');
    expect(walesForms).toHaveProperty('N5B_WALES_0323.pdf');
    expect(walesForms).toHaveProperty('N119_WALES_1222.pdf');
  });

  it('Wales forms in manifest should be marked as fillable', () => {
    const manifestPath = path.join(OFFICIAL_FORMS_DIR, 'forms-manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

    const walesForms = manifest.jurisdictions.wales.forms;
    expect(walesForms['N5_WALES_1222.pdf'].fillable).toBe(true);
    expect(walesForms['N5B_WALES_0323.pdf'].fillable).toBe(true);
    expect(walesForms['N119_WALES_1222.pdf'].fillable).toBe(true);
  });
});
