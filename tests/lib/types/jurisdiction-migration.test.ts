/**
 * Jurisdiction Migration Tests
 *
 * Tests the migration from legacy "england-wales" to canonical jurisdictions
 * This is the ONLY test file that should use legacy jurisdiction values
 */

import { describe, expect, it } from 'vitest';
import {
  migrateToCanonicalJurisdiction,
  type CanonicalJurisdiction,
} from '@/lib/types/jurisdiction';

describe('Jurisdiction Migration', () => {
  describe('migrateToCanonicalJurisdiction', () => {
    it('should preserve canonical jurisdiction values', () => {
      expect(migrateToCanonicalJurisdiction('england')).toBe('england');
      expect(migrateToCanonicalJurisdiction('wales')).toBe('wales');
      expect(migrateToCanonicalJurisdiction('scotland')).toBe('scotland');
      expect(migrateToCanonicalJurisdiction('northern-ireland')).toBe('northern-ireland');
    });

    it('should migrate "england-wales" to "england" by default', () => {
      expect(migrateToCanonicalJurisdiction('england-wales')).toBe('england');
    });

    it('should migrate "england-wales" to "wales" if property_location is wales', () => {
      expect(migrateToCanonicalJurisdiction('england-wales', 'wales')).toBe('wales');
    });

    it('should migrate "england-wales" to "england" if property_location is england', () => {
      expect(migrateToCanonicalJurisdiction('england-wales', 'england')).toBe('england');
    });

    it('should handle "england & wales" variant', () => {
      expect(migrateToCanonicalJurisdiction('england & wales')).toBe('england');
      expect(migrateToCanonicalJurisdiction('england & wales', 'wales')).toBe('wales');
    });

    it('should handle "england and wales" variant', () => {
      expect(migrateToCanonicalJurisdiction('england and wales')).toBe('england');
      expect(migrateToCanonicalJurisdiction('england and wales', 'wales')).toBe('wales');
    });

    it('should handle case-insensitive input', () => {
      expect(migrateToCanonicalJurisdiction('ENGLAND-WALES')).toBe('england');
      expect(migrateToCanonicalJurisdiction('England-Wales')).toBe('england');
      expect(migrateToCanonicalJurisdiction('  england-wales  ')).toBe('england');
    });

    it('should return null for null/undefined', () => {
      expect(migrateToCanonicalJurisdiction(null)).toBeNull();
      expect(migrateToCanonicalJurisdiction(undefined)).toBeNull();
      expect(migrateToCanonicalJurisdiction('')).toBeNull();
    });

    it('should return null for unrecognized values', () => {
      expect(migrateToCanonicalJurisdiction('france')).toBeNull();
      expect(migrateToCanonicalJurisdiction('invalid')).toBeNull();
    });
  });

  describe('Real-world migration scenarios', () => {
    it('should handle wizard API payloads with england-wales', () => {
      // Simulate old wizard data
      const legacyPayload = {
        product: 'notice_only',
        jurisdiction: 'england-wales',
      };

      const migratedJurisdiction = migrateToCanonicalJurisdiction(legacyPayload.jurisdiction);
      expect(migratedJurisdiction).toBe('england');
    });

    it('should handle database records with england-wales and property_location', () => {
      // Simulate old case with property location
      const legacyCaseWales = {
        jurisdiction: 'england-wales',
        property_location: 'wales' as const,
      };

      const migratedJurisdiction = migrateToCanonicalJurisdiction(
        legacyCaseWales.jurisdiction,
        legacyCaseWales.property_location
      );
      expect(migratedJurisdiction).toBe('wales');
    });

    it('should handle database records without property_location (default to england)', () => {
      const legacyCase = {
        jurisdiction: 'england-wales',
        // no property_location
      };

      const migratedJurisdiction = migrateToCanonicalJurisdiction(
        legacyCase.jurisdiction
      );
      expect(migratedJurisdiction).toBe('england');
    });
  });
});
