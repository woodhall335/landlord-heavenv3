/**
 * P0 Final Gate: Blocking Validation Tests
 *
 * These tests verify that the Section 21 pack generation is BLOCKED when:
 * 1. EPC was provided AFTER tenancy start date
 * 2. Gas safety certificate not provided before occupation
 * 3. Prescribed information not served within 30 days of deposit
 * 4. How to Rent not provided before tenancy start (post Oct 2015)
 * 5. Joint parties indicated but names missing
 * 6. More than 2 landlords or 4 tenants indicated
 *
 * These are LEGAL REQUIREMENTS for valid Section 21 notices.
 */

import { describe, it, expect } from 'vitest';
import {
  validateComplianceTiming,
  validateJointParties,
  type ComplianceTimingData,
  type JointPartyData,
} from '@/lib/documents/court-ready-validator';

describe('P0 Blocking Validation - Compliance Timing', () => {
  describe('EPC Timing', () => {
    it('BLOCKS when EPC provided AFTER tenancy start', () => {
      const data: ComplianceTimingData = {
        tenancy_start_date: '2024-01-15',
        epc_provided_date: '2024-01-20', // 5 days AFTER start
      };

      const result = validateComplianceTiming(data);

      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.field === 'epc_timing' && i.severity === 'error')).toBe(true);
    });

    it('PASSES when EPC provided BEFORE tenancy start', () => {
      const data: ComplianceTimingData = {
        tenancy_start_date: '2024-01-15',
        epc_provided_date: '2024-01-10', // 5 days BEFORE start
      };

      const result = validateComplianceTiming(data);

      expect(result.issues.filter(i => i.field === 'epc_timing')).toHaveLength(0);
    });

    it('PASSES when EPC provided ON tenancy start date', () => {
      const data: ComplianceTimingData = {
        tenancy_start_date: '2024-01-15',
        epc_provided_date: '2024-01-15', // Same day
      };

      const result = validateComplianceTiming(data);

      expect(result.issues.filter(i => i.field === 'epc_timing')).toHaveLength(0);
    });
  });

  describe('Gas Safety Timing', () => {
    it('BLOCKS when gas safety provided AFTER occupation', () => {
      const data: ComplianceTimingData = {
        tenancy_start_date: '2024-01-15',
        gas_safety_provided_date: '2024-01-20', // 5 days AFTER occupation
        has_gas_at_property: true,
      };

      const result = validateComplianceTiming(data);

      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.field === 'gas_safety_timing' && i.severity === 'error')).toBe(true);
    });

    it('PASSES when gas safety provided BEFORE occupation', () => {
      const data: ComplianceTimingData = {
        tenancy_start_date: '2024-01-15',
        gas_safety_provided_date: '2024-01-10', // 5 days BEFORE occupation
        has_gas_at_property: true,
      };

      const result = validateComplianceTiming(data);

      expect(result.issues.filter(i => i.field === 'gas_safety_timing')).toHaveLength(0);
    });

    it('SKIPS gas safety validation when no gas at property', () => {
      const data: ComplianceTimingData = {
        tenancy_start_date: '2024-01-15',
        gas_safety_provided_date: '2024-01-20', // Would be invalid if gas present
        has_gas_at_property: false, // No gas - skip validation
      };

      const result = validateComplianceTiming(data);

      expect(result.issues.filter(i => i.field === 'gas_safety_timing')).toHaveLength(0);
    });

    it('BLOCKS when gas safety certificate is >12 months old', () => {
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

      const data: ComplianceTimingData = {
        tenancy_start_date: '2024-01-15',
        gas_safety_check_date: twoYearsAgo.toISOString().split('T')[0],
        gas_safety_provided_date: '2024-01-10',
        has_gas_at_property: true,
      };

      const result = validateComplianceTiming(data);

      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.field === 'gas_safety_expiry' && i.severity === 'error')).toBe(true);
    });
  });

  describe('Gas Safety Pre-Occupation Date (Jan 2026 Fix)', () => {
    /**
     * CRITICAL: The pre-occupation timing check MUST use the date the pre-occupation
     * gas safety record was served to the tenant, NOT the most recent CP12 served date
     * (which may be an annual renewal after tenancy start).
     */

    it('PASSES when pre-occupation served date is BEFORE tenancy start (new field)', () => {
      const data: ComplianceTimingData = {
        tenancy_start_date: '2024-01-15',
        has_gas_at_property: true,
        // User confirmed pre-occupation compliance
        gas_safety_before_occupation: true,
        gas_safety_before_occupation_date: '2024-01-10', // Check date
        gas_safety_record_served_pre_occupation_date: '2024-01-12', // Served BEFORE occupation
        // Latest CP12 is annual renewal (would fail if used for timing)
        gas_safety_provided_date: '2025-01-20',
        gas_safety_check_date: '2025-01-18', // Current within 12 months
      };

      const result = validateComplianceTiming(data);

      // Should NOT have gas_safety_timing error - pre-occupation was compliant
      expect(result.issues.filter(i => i.field === 'gas_safety_timing')).toHaveLength(0);
    });

    it('BLOCKS when pre-occupation served date is AFTER tenancy start (new field)', () => {
      const data: ComplianceTimingData = {
        tenancy_start_date: '2024-01-15',
        has_gas_at_property: true,
        gas_safety_before_occupation: true,
        gas_safety_before_occupation_date: '2024-01-10', // Check was before
        gas_safety_record_served_pre_occupation_date: '2024-01-20', // But served AFTER occupation!
      };

      const result = validateComplianceTiming(data);

      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.field === 'gas_safety_timing' && i.severity === 'error')).toBe(true);
    });

    it('PASSES when annual renewal is after tenancy start BUT pre-occupation record was compliant', () => {
      // This is the KEY FIX scenario:
      // - Pre-occupation CP12 was given before move-in (compliant)
      // - Annual renewal CP12 was served after tenancy started (expected behavior)
      // - System should NOT fail because pre-occupation compliance was met

      // Use dynamic dates to ensure current check is within 12 months
      const now = new Date();
      const sixMonthsAgo = new Date(now);
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const tenancyStart = new Date(sixMonthsAgo);
      tenancyStart.setMonth(tenancyStart.getMonth() - 6); // Tenancy started 12 months ago

      const data: ComplianceTimingData = {
        tenancy_start_date: tenancyStart.toISOString().split('T')[0],
        has_gas_at_property: true,
        // Pre-occupation compliance confirmed
        gas_safety_before_occupation: true,
        gas_safety_before_occupation_date: new Date(tenancyStart.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days before move-in
        gas_safety_record_served_pre_occupation_date: new Date(tenancyStart.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days before move-in
        // Annual renewal in recent past (after tenancy started - normal behavior)
        gas_safety_provided_date: sixMonthsAgo.toISOString().split('T')[0],
        gas_safety_check_date: new Date(sixMonthsAgo.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Current check within 12 months
      };

      const result = validateComplianceTiming(data);

      // Should NOT block - pre-occupation was compliant
      expect(result.issues.filter(i => i.field === 'gas_safety_timing')).toHaveLength(0);
      // Current cert is within 12 months, so no expiry issue either
      expect(result.issues.filter(i => i.field === 'gas_safety_expiry')).toHaveLength(0);
    });

    it('Uses legacy fallback when new field is missing but pre-occupation confirmed', () => {
      // Backward compatibility: old cases without the new field
      const data: ComplianceTimingData = {
        tenancy_start_date: '2024-01-15',
        has_gas_at_property: true,
        // User confirmed pre-occupation compliance (legacy flow)
        gas_safety_before_occupation: true,
        gas_safety_before_occupation_date: '2024-01-10', // Check date BEFORE occupation
        // NEW FIELD IS MISSING - should fall back to using check date
        gas_safety_record_served_pre_occupation_date: undefined,
      };

      const result = validateComplianceTiming(data);

      // Legacy fallback should treat check date as served date -> PASSES
      expect(result.issues.filter(i => i.field === 'gas_safety_timing')).toHaveLength(0);
    });

    it('BLOCKS using general provided_date when no pre-occupation context', () => {
      // No pre-occupation fields set, only general provided_date which is after start
      const data: ComplianceTimingData = {
        tenancy_start_date: '2024-01-15',
        has_gas_at_property: true,
        gas_safety_provided_date: '2024-01-20', // After occupation
        // No pre-occupation fields - system must use gas_safety_provided_date
      };

      const result = validateComplianceTiming(data);

      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.field === 'gas_safety_timing' && i.severity === 'error')).toBe(true);
    });
  });

  describe('Prescribed Information Timing', () => {
    it('BLOCKS when prescribed info served >30 days after deposit', () => {
      const data: ComplianceTimingData = {
        deposit_received_date: '2024-01-01',
        prescribed_info_served_date: '2024-02-15', // 45 days later
      };

      const result = validateComplianceTiming(data);

      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.field === 'prescribed_info_timing' && i.severity === 'error')).toBe(true);
    });

    it('PASSES when prescribed info served within 30 days', () => {
      const data: ComplianceTimingData = {
        deposit_received_date: '2024-01-01',
        prescribed_info_served_date: '2024-01-25', // 24 days later
      };

      const result = validateComplianceTiming(data);

      expect(result.issues.filter(i => i.field === 'prescribed_info_timing')).toHaveLength(0);
    });

    it('PASSES when prescribed info served on day 30', () => {
      const data: ComplianceTimingData = {
        deposit_received_date: '2024-01-01',
        prescribed_info_served_date: '2024-01-31', // Exactly 30 days
      };

      const result = validateComplianceTiming(data);

      expect(result.issues.filter(i => i.field === 'prescribed_info_timing')).toHaveLength(0);
    });
  });

  describe('How to Rent Timing', () => {
    it('BLOCKS when How to Rent provided AFTER tenancy start', () => {
      const data: ComplianceTimingData = {
        tenancy_start_date: '2024-01-15',
        how_to_rent_provided_date: '2024-01-20', // 5 days AFTER start
      };

      const result = validateComplianceTiming(data);

      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.field === 'how_to_rent_timing' && i.severity === 'error')).toBe(true);
    });

    it('PASSES when How to Rent provided BEFORE tenancy start', () => {
      const data: ComplianceTimingData = {
        tenancy_start_date: '2024-01-15',
        how_to_rent_provided_date: '2024-01-10', // 5 days BEFORE start
      };

      const result = validateComplianceTiming(data);

      expect(result.issues.filter(i => i.field === 'how_to_rent_timing')).toHaveLength(0);
    });
  });
});

describe('P0 Blocking Validation - Joint Parties', () => {
  describe('Primary Party Validation', () => {
    it('BLOCKS when landlord name is missing', () => {
      const data: JointPartyData = {
        landlord_full_name: '',
        tenant_full_name: 'Test Tenant',
      };

      const result = validateJointParties(data);

      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.field === 'landlord_full_name')).toBe(true);
    });

    it('BLOCKS when tenant name is missing', () => {
      const data: JointPartyData = {
        landlord_full_name: 'Test Landlord',
        tenant_full_name: '',
      };

      const result = validateJointParties(data);

      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.field === 'tenant_full_name')).toBe(true);
    });
  });

  describe('Joint Landlord Validation', () => {
    it('BLOCKS when joint landlords indicated but second name missing', () => {
      const data: JointPartyData = {
        has_joint_landlords: true,
        landlord_full_name: 'First Landlord',
        landlord_2_name: undefined,
        tenant_full_name: 'Test Tenant',
      };

      const result = validateJointParties(data);

      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.field === 'landlord_2_name')).toBe(true);
    });

    it('BLOCKS when >2 landlords indicated', () => {
      const data: JointPartyData = {
        has_joint_landlords: true,
        num_landlords: 3,
        landlord_full_name: 'First Landlord',
        landlord_2_name: 'Second Landlord',
        tenant_full_name: 'Test Tenant',
      };

      const result = validateJointParties(data);

      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.field === 'num_landlords')).toBe(true);
    });

    it('PASSES when 2 landlords provided correctly', () => {
      const data: JointPartyData = {
        has_joint_landlords: true,
        num_landlords: 2,
        landlord_full_name: 'First Landlord',
        landlord_2_name: 'Second Landlord',
        tenant_full_name: 'Test Tenant',
      };

      const result = validateJointParties(data);

      expect(result.isValid).toBe(true);
    });
  });

  describe('Joint Tenant Validation', () => {
    it('BLOCKS when joint tenants indicated but second name missing', () => {
      const data: JointPartyData = {
        has_joint_tenants: true,
        landlord_full_name: 'Test Landlord',
        tenant_full_name: 'First Tenant',
        tenant_2_name: undefined,
      };

      const result = validateJointParties(data);

      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.field === 'tenant_2_name')).toBe(true);
    });

    it('BLOCKS when >4 tenants indicated', () => {
      const data: JointPartyData = {
        has_joint_tenants: true,
        num_tenants: 5,
        landlord_full_name: 'Test Landlord',
        tenant_full_name: 'First Tenant',
        tenant_2_name: 'Second Tenant',
        tenant_3_name: 'Third Tenant',
        tenant_4_name: 'Fourth Tenant',
      };

      const result = validateJointParties(data);

      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.field === 'num_tenants')).toBe(true);
    });

    it('PASSES when 4 tenants provided correctly', () => {
      const data: JointPartyData = {
        has_joint_tenants: true,
        num_tenants: 4,
        landlord_full_name: 'Test Landlord',
        tenant_full_name: 'First Tenant',
        tenant_2_name: 'Second Tenant',
        tenant_3_name: 'Third Tenant',
        tenant_4_name: 'Fourth Tenant',
      };

      const result = validateJointParties(data);

      expect(result.isValid).toBe(true);
    });

    it('BLOCKS when indicated tenant count exceeds provided names', () => {
      const data: JointPartyData = {
        has_joint_tenants: true,
        num_tenants: 4,
        landlord_full_name: 'Test Landlord',
        tenant_full_name: 'First Tenant',
        tenant_2_name: 'Second Tenant',
        // tenant_3_name and tenant_4_name missing
      };

      const result = validateJointParties(data);

      expect(result.isValid).toBe(false);
      expect(result.issues.some(i => i.field === 'tenant_names')).toBe(true);
    });
  });
});
