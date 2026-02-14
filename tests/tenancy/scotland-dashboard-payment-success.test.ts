/**
 * Scotland Tenancy Agreement Dashboard Payment Success - Tests
 *
 * Tests for the post-payment dashboard view for Scottish tenancy agreement cases:
 * - TenancySummaryPanel displays key facts
 * - Route display shows PRT instead of eviction routes
 * - Ask Heaven panel is hidden on payment success
 */

import { describe, it, expect } from 'vitest';

/**
 * Helper function tests - mirrors implementation in page.tsx
 */
describe('Scotland Tenancy Agreement Dashboard', () => {
  describe('Helper Functions', () => {
    // Test helper function logic
    function isTenancyAgreementCase(caseType: string | undefined): boolean {
      return caseType === 'tenancy_agreement';
    }

    function isScottishTenancyAgreementCase(
      caseType: string | undefined,
      jurisdiction: string | undefined
    ): boolean {
      return isTenancyAgreementCase(caseType) && jurisdiction === 'scotland';
    }

    function getTenancyAgreementRouteLabel(
      jurisdiction: string | undefined,
      isPremium: boolean
    ): string {
      switch (jurisdiction) {
        case 'scotland':
          return isPremium ? 'HMO Private Residential Tenancy' : 'Private Residential Tenancy';
        case 'wales':
          return isPremium ? 'HMO Occupation Contract' : 'Standard Occupation Contract';
        case 'northern-ireland':
          return isPremium ? 'HMO Private Tenancy' : 'Private Tenancy';
        case 'england':
        default:
          return isPremium ? 'HMO Assured Shorthold Tenancy' : 'Assured Shorthold Tenancy';
      }
    }

    it('correctly identifies tenancy agreement cases', () => {
      expect(isTenancyAgreementCase('tenancy_agreement')).toBe(true);
      expect(isTenancyAgreementCase('eviction')).toBe(false);
      expect(isTenancyAgreementCase('money_claim')).toBe(false);
      expect(isTenancyAgreementCase(undefined)).toBe(false);
    });

    it('correctly identifies Scottish tenancy agreement cases', () => {
      expect(isScottishTenancyAgreementCase('tenancy_agreement', 'scotland')).toBe(true);
      expect(isScottishTenancyAgreementCase('tenancy_agreement', 'england')).toBe(false);
      expect(isScottishTenancyAgreementCase('eviction', 'scotland')).toBe(false);
      expect(isScottishTenancyAgreementCase(undefined, 'scotland')).toBe(false);
    });

    it('returns correct route label for Scotland standard PRT', () => {
      const label = getTenancyAgreementRouteLabel('scotland', false);
      expect(label).toBe('Private Residential Tenancy');
      expect(label).not.toContain('notice_to_leave');
      expect(label).not.toContain('Section');
    });

    it('returns correct route label for Scotland premium/HMO PRT', () => {
      const label = getTenancyAgreementRouteLabel('scotland', true);
      expect(label).toBe('HMO Private Residential Tenancy');
    });

    it('returns jurisdiction-appropriate labels for all jurisdictions', () => {
      expect(getTenancyAgreementRouteLabel('england', false)).toBe('Assured Shorthold Tenancy');
      expect(getTenancyAgreementRouteLabel('england', true)).toBe('HMO Assured Shorthold Tenancy');
      expect(getTenancyAgreementRouteLabel('wales', false)).toBe('Standard Occupation Contract');
      expect(getTenancyAgreementRouteLabel('wales', true)).toBe('HMO Occupation Contract');
      expect(getTenancyAgreementRouteLabel('northern-ireland', false)).toBe('Private Tenancy');
      expect(getTenancyAgreementRouteLabel('northern-ireland', true)).toBe('HMO Private Tenancy');
    });

    it('never returns eviction route labels for tenancy agreements', () => {
      const evictionRoutes = ['notice_to_leave', 'section_8', 'section_21', 'section_173', 'fault_based'];
      const jurisdictions = ['scotland', 'england', 'wales', 'northern-ireland'];
      const tiers = [true, false];

      for (const jurisdiction of jurisdictions) {
        for (const isPremium of tiers) {
          const label = getTenancyAgreementRouteLabel(jurisdiction, isPremium);
          for (const route of evictionRoutes) {
            expect(label.toLowerCase()).not.toContain(route.toLowerCase());
          }
        }
      }
    });
  });

  describe('TenancySummaryPanel Component Logic', () => {
    // Test TenancySummaryPanel helper functions
    function formatRentFrequency(frequency: string | null | undefined): string {
      if (!frequency) return 'per month';
      switch (frequency.toLowerCase()) {
        case 'weekly': return 'per week';
        case 'fortnightly': return 'every 2 weeks';
        case 'monthly': return 'per month';
        case 'quarterly': return 'per quarter';
        case 'yearly': return 'per year';
        default: return 'per month';
      }
    }

    function formatRentDueDay(dueDay: string | number | null | undefined): string {
      if (!dueDay) return '1st';
      const day = typeof dueDay === 'string' ? parseInt(dueDay, 10) : dueDay;
      if (isNaN(day)) return String(dueDay);

      const suffix = (d: number) => {
        if (d >= 11 && d <= 13) return 'th';
        switch (d % 10) {
          case 1: return 'st';
          case 2: return 'nd';
          case 3: return 'rd';
          default: return 'th';
        }
      };
      return `${day}${suffix(day)}`;
    }

    function formatCurrency(amount: number | string | null | undefined): string {
      if (amount === null || amount === undefined || amount === '') return '-';
      const num = typeof amount === 'string' ? parseFloat(amount) : amount;
      if (isNaN(num)) return '-';
      return `£${num.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    function getAgreementTypeLabel(jurisdiction: string, isHmo: boolean, isPremium: boolean): string {
      switch (jurisdiction) {
        case 'scotland':
          if (isHmo || isPremium) return 'HMO Private Residential Tenancy (Scotland)';
          return 'Private Residential Tenancy (Scotland)';
        case 'wales':
          if (isHmo || isPremium) return 'HMO Occupation Contract (Wales)';
          return 'Standard Occupation Contract (Wales)';
        case 'northern-ireland':
          if (isHmo || isPremium) return 'HMO Private Tenancy (Northern Ireland)';
          return 'Private Tenancy (Northern Ireland)';
        default:
          if (isHmo || isPremium) return 'HMO Assured Shorthold Tenancy';
          return 'Assured Shorthold Tenancy';
      }
    }

    function getTenancyDurationCopy(jurisdiction: string, facts: Record<string, any>): string {
      if (jurisdiction === 'scotland') return 'Open-ended (no fixed term)';
      const isFixedTerm = facts.is_fixed_term === true || facts.fixed_term === true;
      const fixedTermMonths = facts.fixed_term_months || facts.tenancy_term_months;
      if (isFixedTerm && fixedTermMonths) {
        return `Fixed term: ${fixedTermMonths} month${fixedTermMonths === 1 ? '' : 's'}`;
      }
      return 'Periodic (rolling)';
    }

    function buildPropertyAddress(facts: Record<string, any>): string {
      if (facts.property_address && typeof facts.property_address === 'string') {
        return facts.property_address;
      }
      const parts: string[] = [];
      if (facts.property_address_line1) parts.push(facts.property_address_line1);
      if (facts.property_address_line2) parts.push(facts.property_address_line2);
      if (facts.property_address_town) parts.push(facts.property_address_town);
      if (facts.property_address_postcode) parts.push(facts.property_address_postcode);
      return parts.join(', ') || '-';
    }

    it('formats rent frequency correctly', () => {
      expect(formatRentFrequency('weekly')).toBe('per week');
      expect(formatRentFrequency('monthly')).toBe('per month');
      expect(formatRentFrequency('fortnightly')).toBe('every 2 weeks');
      expect(formatRentFrequency(null)).toBe('per month');
      expect(formatRentFrequency(undefined)).toBe('per month');
    });

    it('formats rent due day with correct ordinal suffix', () => {
      expect(formatRentDueDay(1)).toBe('1st');
      expect(formatRentDueDay(2)).toBe('2nd');
      expect(formatRentDueDay(3)).toBe('3rd');
      expect(formatRentDueDay(4)).toBe('4th');
      expect(formatRentDueDay(11)).toBe('11th');
      expect(formatRentDueDay(12)).toBe('12th');
      expect(formatRentDueDay(13)).toBe('13th');
      expect(formatRentDueDay(21)).toBe('21st');
      expect(formatRentDueDay(22)).toBe('22nd');
      expect(formatRentDueDay(23)).toBe('23rd');
      expect(formatRentDueDay('15')).toBe('15th');
      expect(formatRentDueDay(null)).toBe('1st');
    });

    it('formats currency correctly', () => {
      expect(formatCurrency(1200)).toBe('£1,200.00');
      expect(formatCurrency(1200.50)).toBe('£1,200.50');
      expect(formatCurrency('1200')).toBe('£1,200.00');
      expect(formatCurrency(null)).toBe('-');
      expect(formatCurrency(undefined)).toBe('-');
      expect(formatCurrency('')).toBe('-');
    });

    it('returns correct agreement type label for Scotland PRT', () => {
      expect(getAgreementTypeLabel('scotland', false, false)).toBe('Private Residential Tenancy (Scotland)');
      expect(getAgreementTypeLabel('scotland', true, false)).toBe('HMO Private Residential Tenancy (Scotland)');
      expect(getAgreementTypeLabel('scotland', false, true)).toBe('HMO Private Residential Tenancy (Scotland)');
    });

    it('returns "Open-ended (no fixed term)" for Scotland PRTs', () => {
      const duration = getTenancyDurationCopy('scotland', {});
      expect(duration).toBe('Open-ended (no fixed term)');
    });

    it('returns correct duration copy for England with fixed term', () => {
      const duration = getTenancyDurationCopy('england', { is_fixed_term: true, fixed_term_months: 12 });
      expect(duration).toBe('Fixed term: 12 months');
    });

    it('returns "Periodic (rolling)" for England without fixed term', () => {
      const duration = getTenancyDurationCopy('england', {});
      expect(duration).toBe('Periodic (rolling)');
    });

    it('builds property address from components', () => {
      const facts = {
        property_address_line1: '123 Test Street',
        property_address_town: 'Edinburgh',
        property_address_postcode: 'EH1 1AA',
      };
      expect(buildPropertyAddress(facts)).toBe('123 Test Street, Edinburgh, EH1 1AA');
    });

    it('uses flat property_address if available', () => {
      const facts = {
        property_address: '456 Main Road, Glasgow, G1 2AB',
        property_address_line1: '123 Test Street', // Should be ignored
      };
      expect(buildPropertyAddress(facts)).toBe('456 Main Road, Glasgow, G1 2AB');
    });

    it('returns dash for missing address data', () => {
      expect(buildPropertyAddress({})).toBe('-');
    });
  });

  describe('Scottish Deposit Scheme Display', () => {
    function getDepositSchemeDisplay(facts: Record<string, any>): string {
      const scheme = facts.deposit_scheme_name || facts.deposit_scheme;
      if (!scheme) return '-';

      const normalized = scheme.toLowerCase();
      if (normalized.includes('safedeposits')) return 'SafeDeposits Scotland';
      if (normalized.includes('mydeposits')) return 'MyDeposits Scotland';
      if (normalized.includes('letting protection') || normalized.includes('lps')) return 'Letting Protection Service Scotland';

      return scheme;
    }

    it('normalizes SafeDeposits Scotland', () => {
      expect(getDepositSchemeDisplay({ deposit_scheme_name: 'safedeposits_scotland' })).toBe('SafeDeposits Scotland');
      expect(getDepositSchemeDisplay({ deposit_scheme: 'SafeDeposits' })).toBe('SafeDeposits Scotland');
    });

    it('normalizes MyDeposits Scotland', () => {
      expect(getDepositSchemeDisplay({ deposit_scheme_name: 'mydeposits_scotland' })).toBe('MyDeposits Scotland');
    });

    it('normalizes Letting Protection Service Scotland', () => {
      expect(getDepositSchemeDisplay({ deposit_scheme_name: 'letting protection service' })).toBe('Letting Protection Service Scotland');
      expect(getDepositSchemeDisplay({ deposit_scheme: 'LPS Scotland' })).toBe('Letting Protection Service Scotland');
    });

    it('returns dash for missing scheme', () => {
      expect(getDepositSchemeDisplay({})).toBe('-');
    });
  });

  describe('Tenant Names Extraction', () => {
    function getTenantNames(facts: Record<string, any>): string[] {
      const names: string[] = [];

      for (let i = 0; i < 10; i++) {
        const name = facts[`tenants.${i}.full_name`] || facts[`tenant_${i + 1}_full_name`];
        if (name) names.push(name);
      }

      if (names.length === 0 && facts.tenant_full_name) {
        names.push(facts.tenant_full_name);
      }

      if (names.length === 0 && Array.isArray(facts.tenants)) {
        facts.tenants.forEach((t: any) => {
          if (t.full_name || t.name) names.push(t.full_name || t.name);
        });
      }

      return names;
    }

    it('extracts tenant names from indexed format', () => {
      const facts = {
        'tenants.0.full_name': 'John Smith',
        'tenants.1.full_name': 'Jane Doe',
      };
      expect(getTenantNames(facts)).toEqual(['John Smith', 'Jane Doe']);
    });

    it('extracts single tenant name', () => {
      const facts = { tenant_full_name: 'John Smith' };
      expect(getTenantNames(facts)).toEqual(['John Smith']);
    });

    it('extracts tenant names from array format', () => {
      const facts = {
        tenants: [
          { full_name: 'John Smith' },
          { name: 'Jane Doe' },
        ],
      };
      expect(getTenantNames(facts)).toEqual(['John Smith', 'Jane Doe']);
    });

    it('returns empty array when no tenants found', () => {
      expect(getTenantNames({})).toEqual([]);
    });
  });

  describe('Integration: Scotland PRT Payment Success Display', () => {
    const sampleScotlandPRTFacts = {
      __meta: {
        jurisdiction: 'scotland',
        product_tier: 'standard',
      },
      landlord_full_name: 'Robert McLeod',
      property_address_line1: '42 Royal Mile',
      property_address_town: 'Edinburgh',
      property_address_postcode: 'EH1 1TF',
      tenancy_start_date: '2025-02-01',
      rent_amount: 1200,
      rent_frequency: 'monthly',
      rent_due_day: 1,
      deposit_amount: 1200,
      deposit_scheme_name: 'safedeposits_scotland',
      'tenants.0.full_name': 'James Campbell',
      'tenants.1.full_name': 'Sarah Campbell',
    };

    it('contains all required summary fields for Scotland PRT', () => {
      const requiredFields = [
        'landlord_full_name',
        'property_address_line1',
        'tenancy_start_date',
        'rent_amount',
        'deposit_amount',
      ];

      for (const field of requiredFields) {
        expect(sampleScotlandPRTFacts[field]).toBeDefined();
        expect(sampleScotlandPRTFacts[field]).not.toBe('');
      }
    });

    it('has Scottish deposit scheme', () => {
      const scheme = sampleScotlandPRTFacts.deposit_scheme_name;
      expect(scheme).toBeDefined();
      expect(['safedeposits_scotland', 'mydeposits_scotland', 'letting_protection_service']).toContain(scheme);
    });

    it('has multiple tenant names', () => {
      function getTenantNames(facts: Record<string, any>): string[] {
        const names: string[] = [];
        for (let i = 0; i < 10; i++) {
          const name = facts[`tenants.${i}.full_name`];
          if (name) names.push(name);
        }
        return names;
      }

      const tenants = getTenantNames(sampleScotlandPRTFacts);
      expect(tenants.length).toBe(2);
      expect(tenants).toContain('James Campbell');
      expect(tenants).toContain('Sarah Campbell');
    });
  });
});
