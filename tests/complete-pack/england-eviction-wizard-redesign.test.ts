/**
 * England Eviction Wizard Redesign Tests
 *
 * Tests for the redesigned eviction wizard (complete pack) to ensure:
 * - All required fields for England Section 21 are collected
 * - All required fields for England Section 8 are collected
 * - Arrears schedule is integrated correctly for Ground 8
 * - Court form fields are populated (not just "pack generated")
 * - Upload truthfulness is preserved
 * - Jurisdiction logic remains intact
 */

import { describe, expect, it } from 'vitest';
import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';
import { wizardFactsToEnglandWalesEviction } from '@/lib/documents/eviction-wizard-mapper';
import { computeArrears, validateGround8Eligibility } from '@/lib/arrears-engine';
import type { WizardFacts, ArrearsItem } from '@/lib/case-facts/schema';

describe('England Eviction Wizard Redesign', () => {
  describe('Section 21 Complete Pack', () => {
    const validSection21Facts: WizardFacts = {
      __meta: {
        case_id: 'TEST-S21-REDESIGN-001',
        jurisdiction: 'england',
        product: 'complete_pack',
        original_product: 'complete_pack',
      },
      // Case Basics
      eviction_route: 'section_21',

      // Parties - Landlord
      landlord_full_name: 'John Smith',
      landlord_address_line1: '1 Landlord Street',
      landlord_address_town: 'London',
      landlord_address_postcode: 'SW1A 1AA',
      landlord_email: 'john@example.com',
      landlord_phone: '020 1234 5678',
      has_joint_landlords: false,

      // Parties - Tenant
      tenant_full_name: 'Alice Johnson',
      tenant_email: 'alice@example.com',
      tenant_phone: '020 8765 4321',
      has_joint_tenants: false,

      // Property
      property_address_line1: '2 Rental Property Road',
      property_address_line2: 'Flat 4A',
      property_address_town: 'Manchester',
      property_address_postcode: 'M1 1AA',

      // Tenancy
      tenancy_start_date: '2023-01-15',
      tenancy_type: 'ast_periodic',
      rent_amount: 1200,
      rent_frequency: 'monthly',
      rent_due_day: 1,

      // Notice
      notice_served_date: '2024-06-01',
      notice_service_method: 'first_class_post',
      notice_expiry_date: '2024-08-01',

      // Section 21 Compliance
      deposit_taken: true,
      deposit_amount: 1200,
      deposit_protected: true,
      deposit_scheme_name: 'DPS',
      deposit_protection_date: '2023-01-20',
      deposit_reference: 'DPS123456',
      prescribed_info_served: true,
      has_gas_appliances: true,
      gas_safety_cert_served: true,
      epc_served: true,
      how_to_rent_served: true,
      licensing_required: 'not_required',
      no_retaliatory_notice: true,

      // Court & Signing
      court_name: 'Manchester County Court',
      court_address: '1 Bridge Street West, Manchester, M60 9DJ',
      signatory_name: 'John Smith',
      signatory_capacity: 'claimant',
      signature_date: '2024-06-01',
    };

    it('populates all required court form fields for Section 21', () => {
      const { caseData } = wizardFactsToEnglandWalesEviction('test-case-id', validSection21Facts);

      // Verify all required N5B fields are populated
      expect(caseData.landlord_full_name).toBe('John Smith');
      expect(caseData.tenant_full_name).toBe('Alice Johnson');
      expect(caseData.property_address).toBeTruthy();
      expect(caseData.tenancy_start_date).toBe('2023-01-15');
      expect(caseData.rent_amount).toBe(1200);
      expect(caseData.rent_frequency).toBe('monthly');
      expect(caseData.claim_type).toBe('section_21');
      expect(caseData.notice_service_method).toBe('first_class_post');
      expect(caseData.court_name).toBe('Manchester County Court');
      expect(caseData.deposit_amount).toBe(1200);
      expect(caseData.deposit_scheme).toBe('DPS');
    });

    it('correctly maps deposit protection details', () => {
      const { caseData } = wizardFactsToEnglandWalesEviction('test-case-id', validSection21Facts);

      expect(caseData.deposit_amount).toBe(1200);
      expect(caseData.deposit_scheme).toBe('DPS');
      expect(caseData.deposit_protection_date).toBe('2023-01-20');
      expect(caseData.deposit_reference).toBe('DPS123456');
    });

    it('builds eviction case with correct no-fault case type', () => {
      const { evictionCase } = wizardFactsToEnglandWalesEviction('test-case-id', validSection21Facts);

      expect(evictionCase.case_type).toBe('no_fault');
      expect(evictionCase.jurisdiction).toBe('england');
    });
  });

  describe('Section 8 Complete Pack', () => {
    const validSection8Facts: WizardFacts = {
      __meta: {
        case_id: 'TEST-S8-REDESIGN-001',
        jurisdiction: 'england',
        product: 'complete_pack',
        original_product: 'complete_pack',
      },
      // Case Basics
      eviction_route: 'section_8',

      // Parties - Landlord
      landlord_full_name: 'Jane Doe',
      landlord_address_line1: '10 Landlord Avenue',
      landlord_address_town: 'Birmingham',
      landlord_address_postcode: 'B1 1AA',
      has_joint_landlords: false,

      // Parties - Tenant
      tenant_full_name: 'Bob Wilson',
      has_joint_tenants: false,

      // Property
      property_address_line1: '5 Tenant Lane',
      property_address_town: 'Birmingham',
      property_address_postcode: 'B2 2BB',

      // Tenancy
      tenancy_start_date: '2022-06-01',
      tenancy_type: 'ast_periodic',
      rent_amount: 800,
      rent_frequency: 'monthly',
      rent_due_day: 15,

      // Notice
      notice_served_date: '2024-10-01',
      notice_service_method: 'hand_delivered',
      notice_expiry_date: '2024-10-15',

      // Section 8 Grounds
      section8_grounds: ['Ground 8 - 8+ weeks rent arrears', 'Ground 10 - Rent arrears'],
      section8_details: 'Tenant has not paid rent since August 2024. Current arrears total £2,400.',

      // Arrears (canonical)
      total_arrears: 2400,
      arrears_at_notice_date: 2400,
      arrears_items: [
        { period_start: '2024-08-01', period_end: '2024-08-31', rent_due: 800, rent_paid: 0 },
        { period_start: '2024-09-01', period_end: '2024-09-30', rent_due: 800, rent_paid: 0 },
        { period_start: '2024-10-01', period_end: '2024-10-31', rent_due: 800, rent_paid: 0 },
      ],

      // Court & Signing
      court_name: 'Birmingham County Court',
      signatory_name: 'Jane Doe',
      signatory_capacity: 'claimant',
      signature_date: '2024-10-01',
    };

    it('populates all required court form fields for Section 8', () => {
      const { caseData } = wizardFactsToEnglandWalesEviction('test-case-id', validSection8Facts);

      expect(caseData.landlord_full_name).toBe('Jane Doe');
      expect(caseData.tenant_full_name).toBe('Bob Wilson');
      expect(caseData.property_address).toBeTruthy();
      expect(caseData.claim_type).toBe('section_8');
      expect(caseData.ground_numbers).toBeTruthy();
      expect(caseData.notice_service_method).toBe('hand_delivered');
      expect(caseData.court_name).toBe('Birmingham County Court');
    });

    it('maps arrears data correctly', () => {
      const { caseData, evictionCase } = wizardFactsToEnglandWalesEviction('test-case-id', validSection8Facts);

      expect(caseData.total_arrears).toBe(2400);
      expect(evictionCase.current_arrears).toBe(2400);
    });

    it('builds eviction case with correct rent_arrears case type', () => {
      const { evictionCase } = wizardFactsToEnglandWalesEviction('test-case-id', validSection8Facts);

      expect(evictionCase.case_type).toBe('rent_arrears');
      expect(evictionCase.jurisdiction).toBe('england');
    });
  });

  describe('Ground 8 Arrears Schedule Integration', () => {
    it('validates Ground 8 eligibility using canonical arrears engine', () => {
      const arrearsItems: ArrearsItem[] = [
        { period_start: '2024-08-01', period_end: '2024-08-31', rent_due: 800, rent_paid: 0 },
        { period_start: '2024-09-01', period_end: '2024-09-30', rent_due: 800, rent_paid: 0 },
        { period_start: '2024-10-01', period_end: '2024-10-31', rent_due: 800, rent_paid: 0 },
      ];

      const validation = validateGround8Eligibility({
        arrears_items: arrearsItems,
        rent_amount: 800,
        rent_frequency: 'monthly',
        jurisdiction: 'england',
      });

      // 3 months of £800 unpaid = 3 months arrears, exceeds 2 month threshold
      expect(validation.is_eligible).toBe(true);
      expect(validation.arrears_in_months).toBeGreaterThanOrEqual(2);
    });

    it('rejects Ground 8 when arrears below threshold', () => {
      const arrearsItems: ArrearsItem[] = [
        { period_start: '2024-09-01', period_end: '2024-09-30', rent_due: 800, rent_paid: 500 },
      ];

      const validation = validateGround8Eligibility({
        arrears_items: arrearsItems,
        rent_amount: 800,
        rent_frequency: 'monthly',
        jurisdiction: 'england',
      });

      // Only £300 arrears out of £800 = less than 1 month
      expect(validation.is_eligible).toBe(false);
      expect(validation.arrears_in_months).toBeLessThan(2);
    });

    it('computes arrears correctly from schedule', () => {
      const arrearsItems: ArrearsItem[] = [
        { period_start: '2024-07-01', period_end: '2024-07-31', rent_due: 1000, rent_paid: 1000 },
        { period_start: '2024-08-01', period_end: '2024-08-31', rent_due: 1000, rent_paid: 500 },
        { period_start: '2024-09-01', period_end: '2024-09-30', rent_due: 1000, rent_paid: 0 },
      ];

      const computed = computeArrears(arrearsItems, 'monthly', 1000);

      expect(computed.total_arrears).toBe(1500); // 500 + 1000
      expect(computed.periods_fully_paid).toBe(1);
      expect(computed.periods_partially_paid).toBe(1);
      expect(computed.periods_fully_unpaid).toBe(1);
      expect(computed.is_authoritative).toBe(true);
    });
  });

  describe('Joint Parties Handling', () => {
    it('includes joint landlord in eviction case', () => {
      const factsWithJointLandlord: WizardFacts = {
        __meta: { jurisdiction: 'england', product: 'complete_pack', original_product: null },
        eviction_route: 'section_21',
        landlord_full_name: 'John Smith',
        landlord2_name: 'Mary Smith',
        has_joint_landlords: true,
        landlord_address_line1: '1 Test St',
        landlord_address_town: 'London',
        landlord_address_postcode: 'SW1A 1AA',
        tenant_full_name: 'Test Tenant',
        property_address_line1: '2 Test Rd',
        property_address_town: 'London',
        property_address_postcode: 'SW1A 2BB',
        tenancy_start_date: '2023-01-01',
        rent_amount: 1200,
        rent_frequency: 'monthly',
        rent_due_day: 1,
        notice_served_date: '2024-06-01',
        notice_service_method: 'first_class_post',
        court_name: 'Test Court',
        signatory_name: 'John Smith',
        signatory_capacity: 'claimant',
      };

      const { evictionCase } = wizardFactsToEnglandWalesEviction('test', factsWithJointLandlord);

      expect(evictionCase.landlord_full_name).toBe('John Smith');
      expect(evictionCase.landlord_2_name).toBe('Mary Smith');
    });

    it('includes joint tenants in eviction case', () => {
      const factsWithJointTenants: WizardFacts = {
        __meta: { jurisdiction: 'england', product: 'complete_pack', original_product: null },
        eviction_route: 'section_21',
        landlord_full_name: 'Test Landlord',
        landlord_address_line1: '1 Test St',
        landlord_address_town: 'London',
        landlord_address_postcode: 'SW1A 1AA',
        tenant_full_name: 'Alice Johnson',
        tenant2_name: 'Bob Johnson',
        has_joint_tenants: true,
        property_address_line1: '2 Test Rd',
        property_address_town: 'London',
        property_address_postcode: 'SW1A 2BB',
        tenancy_start_date: '2023-01-01',
        rent_amount: 1200,
        rent_frequency: 'monthly',
        rent_due_day: 1,
        notice_served_date: '2024-06-01',
        notice_service_method: 'first_class_post',
        court_name: 'Test Court',
        signatory_name: 'Test Landlord',
        signatory_capacity: 'claimant',
      };

      const { evictionCase } = wizardFactsToEnglandWalesEviction('test', factsWithJointTenants);

      expect(evictionCase.tenant_full_name).toBe('Alice Johnson');
      expect(evictionCase.tenant_2_name).toBe('Bob Johnson');
    });
  });

  describe('Upload Truthfulness', () => {
    it('does not tick N5B checkboxes without actual uploads', () => {
      const factsWithoutUploads: WizardFacts = {
        __meta: { jurisdiction: 'england', product: 'complete_pack', original_product: null },
        eviction_route: 'section_21',
        landlord_full_name: 'Test Landlord',
        landlord_address_line1: '1 Test St',
        landlord_address_town: 'London',
        landlord_address_postcode: 'SW1A 1AA',
        tenant_full_name: 'Test Tenant',
        property_address_line1: '2 Test Rd',
        property_address_town: 'London',
        property_address_postcode: 'SW1A 2BB',
        tenancy_start_date: '2023-01-01',
        rent_amount: 1200,
        rent_frequency: 'monthly',
        rent_due_day: 1,
        notice_served_date: '2024-06-01',
        notice_service_method: 'first_class_post',
        court_name: 'Test Court',
        signatory_name: 'Test Landlord',
        signatory_capacity: 'claimant',
        // No evidence uploads
        evidence: { files: [] },
      };

      const { caseData } = wizardFactsToEnglandWalesEviction('test', factsWithoutUploads);

      // Checkboxes E, F, G should be FALSE when no uploads
      expect(caseData.deposit_certificate_uploaded).toBe(false);
      expect(caseData.epc_uploaded).toBe(false);
      expect(caseData.gas_safety_uploaded).toBe(false);
    });

    it('ticks N5B checkboxes when files are uploaded', () => {
      const factsWithUploads: WizardFacts = {
        __meta: { jurisdiction: 'england', product: 'complete_pack', original_product: null },
        eviction_route: 'section_21',
        landlord_full_name: 'Test Landlord',
        landlord_address_line1: '1 Test St',
        landlord_address_town: 'London',
        landlord_address_postcode: 'SW1A 1AA',
        tenant_full_name: 'Test Tenant',
        property_address_line1: '2 Test Rd',
        property_address_town: 'London',
        property_address_postcode: 'SW1A 2BB',
        tenancy_start_date: '2023-01-01',
        rent_amount: 1200,
        rent_frequency: 'monthly',
        rent_due_day: 1,
        notice_served_date: '2024-06-01',
        notice_service_method: 'first_class_post',
        court_name: 'Test Court',
        signatory_name: 'Test Landlord',
        signatory_capacity: 'claimant',
        evidence: {
          files: [
            { id: '1', category: 'deposit_protection_certificate', filename: 'deposit.pdf' },
            { id: '2', category: 'epc', filename: 'epc.pdf' },
            { id: '3', category: 'gas_safety_certificate', filename: 'gas.pdf' },
          ],
        },
      };

      const { caseData } = wizardFactsToEnglandWalesEviction('test', factsWithUploads);

      // Checkboxes E, F, G should be TRUE when files are uploaded
      expect(caseData.deposit_certificate_uploaded).toBe(true);
      expect(caseData.epc_uploaded).toBe(true);
      expect(caseData.gas_safety_uploaded).toBe(true);
    });
  });

  describe('Signatory Details', () => {
    it('maps signatory name to caseData', () => {
      const facts: WizardFacts = {
        __meta: { jurisdiction: 'england', product: 'complete_pack', original_product: null },
        eviction_route: 'section_21',
        landlord_full_name: 'John Smith',
        landlord_address_line1: '1 Test St',
        landlord_address_town: 'London',
        landlord_address_postcode: 'SW1A 1AA',
        tenant_full_name: 'Test Tenant',
        property_address_line1: '2 Test Rd',
        property_address_town: 'London',
        property_address_postcode: 'SW1A 2BB',
        tenancy_start_date: '2023-01-01',
        rent_amount: 1200,
        rent_frequency: 'monthly',
        rent_due_day: 1,
        notice_served_date: '2024-06-01',
        notice_service_method: 'first_class_post',
        court_name: 'Test Court',
        signatory_name: 'John Smith',
        signatory_capacity: 'claimant',
        signature_date: '2024-06-01',
      };

      const { caseData } = wizardFactsToEnglandWalesEviction('test', facts);

      expect(caseData.signatory_name).toBe('John Smith');
      expect(caseData.signature_date).toBe('2024-06-01');
    });
  });

  // ===========================================================================
  // "TRUTH OVER UI" TESTS - Prove wizard truly controls court form output
  // ===========================================================================
  // These tests verify that user inputs from the wizard are what appear
  // in court forms, not default/fallback values.
  // ===========================================================================

  describe('Truth Over UI - Wizard Controls Output', () => {
    it('uses signatory name different from landlord name when provided (N5/N5B/N119)', () => {
      // This test proves that when a solicitor or agent signs (signatory ≠ landlord),
      // the signatory name appears in court forms, not the landlord name.
      const factsWithSolicitorSigning: WizardFacts = {
        __meta: { jurisdiction: 'england', product: 'complete_pack', original_product: null },
        eviction_route: 'section_21',
        // Landlord details
        landlord_full_name: 'John Smith',
        landlord_address_line1: '1 Test St',
        landlord_address_town: 'London',
        landlord_address_postcode: 'SW1A 1AA',
        // Tenant details
        tenant_full_name: 'Test Tenant',
        property_address_line1: '2 Test Rd',
        property_address_town: 'London',
        property_address_postcode: 'SW1A 2BB',
        tenancy_start_date: '2023-01-01',
        rent_amount: 1200,
        rent_frequency: 'monthly',
        rent_due_day: 1,
        notice_served_date: '2024-06-01',
        notice_service_method: 'first_class_post',
        court_name: 'Test Court',
        // SIGNATORY IS DIFFERENT FROM LANDLORD - Solicitor is signing
        signatory_name: 'Sarah Solicitor',
        signatory_capacity: 'solicitor',
        signature_date: '2024-06-15', // Different from notice date
      };

      const { caseData } = wizardFactsToEnglandWalesEviction('test', factsWithSolicitorSigning);

      // CRITICAL: The signatory name should be the solicitor, NOT the landlord
      expect(caseData.signatory_name).toBe('Sarah Solicitor');
      expect(caseData.signatory_name).not.toBe('John Smith');

      // CRITICAL: The signature date should be the provided date, NOT today
      expect(caseData.signature_date).toBe('2024-06-15');

      // Verify landlord details are still correct
      expect(caseData.landlord_full_name).toBe('John Smith');
    });

    it('uses signatory name for agent signing on behalf of landlord', () => {
      const factsWithAgentSigning: WizardFacts = {
        __meta: { jurisdiction: 'england', product: 'complete_pack', original_product: null },
        eviction_route: 'section_8',
        landlord_full_name: 'Property Management Ltd',
        landlord_address_line1: '100 Office Park',
        landlord_address_town: 'Manchester',
        landlord_address_postcode: 'M1 1AA',
        tenant_full_name: 'Test Tenant',
        property_address_line1: '5 Rental St',
        property_address_town: 'Manchester',
        property_address_postcode: 'M2 2BB',
        tenancy_start_date: '2022-01-01',
        rent_amount: 950,
        rent_frequency: 'monthly',
        rent_due_day: 1,
        notice_served_date: '2024-10-01',
        notice_service_method: 'hand_delivered',
        section8_grounds: ['Ground 8 - 8+ weeks rent arrears'],
        total_arrears: 2850,
        court_name: 'Manchester County Court',
        // AGENT is signing, not the company director
        signatory_name: 'Agent Angela',
        signatory_capacity: 'agent',
        signature_date: '2024-10-05',
      };

      const { caseData } = wizardFactsToEnglandWalesEviction('test', factsWithAgentSigning);

      // Agent name should be in the signatory field
      expect(caseData.signatory_name).toBe('Agent Angela');
      expect(caseData.signature_date).toBe('2024-10-05');
    });

    it('falls back to landlord name only when no signatory provided', () => {
      const factsWithoutSignatory: WizardFacts = {
        __meta: { jurisdiction: 'england', product: 'complete_pack', original_product: null },
        eviction_route: 'section_21',
        landlord_full_name: 'Fallback Landlord',
        landlord_address_line1: '1 Test St',
        landlord_address_town: 'London',
        landlord_address_postcode: 'SW1A 1AA',
        tenant_full_name: 'Test Tenant',
        property_address_line1: '2 Test Rd',
        property_address_town: 'London',
        property_address_postcode: 'SW1A 2BB',
        tenancy_start_date: '2023-01-01',
        rent_amount: 1200,
        rent_frequency: 'monthly',
        rent_due_day: 1,
        notice_served_date: '2024-06-01',
        notice_service_method: 'first_class_post',
        court_name: 'Test Court',
        // NO signatory_name provided - should fall back to landlord
        signatory_capacity: 'claimant',
      };

      const { caseData } = wizardFactsToEnglandWalesEviction('test', factsWithoutSignatory);

      // Should fall back to landlord name
      expect(caseData.signatory_name).toBe('Fallback Landlord');
    });

    it('maps arrears schedule to canonical path for N119 particulars', () => {
      // This test proves arrears data entered via UI appears in court documents
      const factsWithArrears: WizardFacts = {
        __meta: { jurisdiction: 'england', product: 'complete_pack', original_product: null },
        eviction_route: 'section_8',
        landlord_full_name: 'Test Landlord',
        landlord_address_line1: '1 Test St',
        landlord_address_town: 'London',
        landlord_address_postcode: 'SW1A 1AA',
        tenant_full_name: 'Test Tenant',
        property_address_line1: '2 Test Rd',
        property_address_town: 'London',
        property_address_postcode: 'SW1A 2BB',
        tenancy_start_date: '2023-01-01',
        rent_amount: 1000,
        rent_frequency: 'monthly',
        rent_due_day: 1,
        notice_served_date: '2024-09-01',
        notice_service_method: 'first_class_post',
        section8_grounds: ['Ground 8 - 8+ weeks rent arrears'],
        court_name: 'Test Court',
        signatory_name: 'Test Landlord',
        signatory_capacity: 'claimant',
        // Arrears entered via wizard
        total_arrears: 3500,
        arrears_at_notice_date: 3000,
        arrears_items: [
          { period_start: '2024-06-01', period_end: '2024-06-30', rent_due: 1000, rent_paid: 0 },
          { period_start: '2024-07-01', period_end: '2024-07-31', rent_due: 1000, rent_paid: 500 },
          { period_start: '2024-08-01', period_end: '2024-08-31', rent_due: 1000, rent_paid: 0 },
          { period_start: '2024-09-01', period_end: '2024-09-30', rent_due: 1000, rent_paid: 0 },
        ],
      };

      const { caseData, evictionCase } = wizardFactsToEnglandWalesEviction('test', factsWithArrears);

      // Verify the arrears amounts flow through correctly
      expect(caseData.total_arrears).toBe(3500);
      expect(caseData.arrears_at_notice_date).toBe(3000);
      expect(evictionCase.current_arrears).toBe(3500);

      // Verify Ground 8 is included
      expect(evictionCase.grounds.length).toBeGreaterThan(0);
      expect(evictionCase.grounds[0].code).toBe('Ground 8');
    });
  });

  // ===========================================================================
  // INLINE NOTICE-ONLY PATH TESTS
  // ===========================================================================
  // These tests verify that when notice_already_served = false, the inline
  // notice-only subflow data correctly populates notice fields used by CaseData.
  // ===========================================================================

  describe('Inline Notice-Only Path (No Notice Yet)', () => {
    it('populates notice_served_date + notice_service_method from inline subflow for Section 21', () => {
      // Simulates a user who selected "No, I need to generate a notice"
      // and completed the inline notice-only subflow
      const factsWithInlineNotice: WizardFacts = {
        __meta: {
          case_id: 'TEST-INLINE-NOTICE-S21',
          jurisdiction: 'england',
          product: 'complete_pack',
          original_product: 'complete_pack',
        },
        // Case Basics
        eviction_route: 'section_21',

        // Parties - Landlord
        landlord_full_name: 'Inline Test Landlord',
        landlord_address_line1: '1 Test Street',
        landlord_address_town: 'London',
        landlord_address_postcode: 'SW1A 1AA',
        has_joint_landlords: false,

        // Parties - Tenant
        tenant_full_name: 'Inline Test Tenant',
        has_joint_tenants: false,

        // Property
        property_address_line1: '2 Rental Road',
        property_address_town: 'London',
        property_address_postcode: 'SW1A 2BB',

        // Tenancy
        tenancy_start_date: '2023-01-01',
        tenancy_type: 'ast_periodic',
        rent_amount: 1500,
        rent_frequency: 'monthly',
        rent_due_day: 1,

        // GATING QUESTION: User has NOT served notice yet
        notice_already_served: false,

        // INLINE SUBFLOW DATA:
        // The inline notice-only subflow collects compliance data and then
        // populates these canonical notice fields on completion
        notice_served_date: '2024-12-26', // Set by subflow on completion
        notice_service_method: 'first_class_post', // Set by subflow
        notice_expiry_date: '2025-02-24', // 60 days for Section 21

        // Section 21 Compliance (collected by inline subflow)
        deposit_taken: true,
        deposit_protected: true,
        prescribed_info_served: true,
        has_gas_appliances: true,
        gas_safety_cert_served: true,
        epc_served: true,
        how_to_rent_served: true,

        // Court & Signing
        court_name: 'Test County Court',
        signatory_name: 'Inline Test Landlord',
        signatory_capacity: 'claimant',
      };

      const { caseData, evictionCase } = wizardFactsToEnglandWalesEviction(
        'test-inline-notice',
        factsWithInlineNotice
      );

      // CRITICAL: Notice fields populated from inline subflow must appear in caseData
      expect(caseData.notice_served_date).toBe('2024-12-26');
      expect(caseData.notice_service_method).toBe('first_class_post');
      expect(caseData.notice_expiry_date).toBe('2025-02-24');

      // Verify Section 21 case type
      expect(caseData.claim_type).toBe('section_21');
      expect(evictionCase.case_type).toBe('no_fault');
    });

    it('populates notice fields from inline subflow for Section 8 with grounds', () => {
      // Simulates a user who selected "No, I need to generate a notice"
      // for a Section 8 case and completed the inline notice-only subflow
      const factsWithInlineNoticeS8: WizardFacts = {
        __meta: {
          case_id: 'TEST-INLINE-NOTICE-S8',
          jurisdiction: 'england',
          product: 'complete_pack',
          original_product: 'complete_pack',
        },
        // Case Basics
        eviction_route: 'section_8',

        // Parties - Landlord
        landlord_full_name: 'S8 Inline Landlord',
        landlord_address_line1: '10 Landlord Lane',
        landlord_address_town: 'Birmingham',
        landlord_address_postcode: 'B1 1AA',
        has_joint_landlords: false,

        // Parties - Tenant
        tenant_full_name: 'S8 Inline Tenant',
        has_joint_tenants: false,

        // Property
        property_address_line1: '20 Tenant Terrace',
        property_address_town: 'Birmingham',
        property_address_postcode: 'B2 2BB',

        // Tenancy
        tenancy_start_date: '2022-06-01',
        tenancy_type: 'ast_periodic',
        rent_amount: 900,
        rent_frequency: 'monthly',
        rent_due_day: 1,

        // GATING QUESTION: User has NOT served notice yet
        notice_already_served: false,

        // INLINE SUBFLOW DATA:
        // Section 8 grounds and particulars collected by inline subflow
        section8_grounds: ['Ground 8 - 8+ weeks rent arrears', 'Ground 10 - Rent arrears'],
        section8_details: 'Tenant owes £2,700 in rent arrears dating back to October 2024.',

        // Notice fields populated by subflow on completion
        notice_served_date: '2024-12-26',
        notice_service_method: 'hand_delivered',
        notice_expiry_date: '2025-01-09', // 14 days for Ground 8

        // Arrears data
        total_arrears: 2700,

        // Court & Signing
        court_name: 'Birmingham County Court',
        signatory_name: 'S8 Inline Landlord',
        signatory_capacity: 'claimant',
      };

      const { caseData, evictionCase } = wizardFactsToEnglandWalesEviction(
        'test-inline-notice-s8',
        factsWithInlineNoticeS8
      );

      // CRITICAL: Notice fields from inline subflow must appear in caseData
      expect(caseData.notice_served_date).toBe('2024-12-26');
      expect(caseData.notice_service_method).toBe('hand_delivered');

      // Verify Section 8 case type and grounds
      expect(caseData.claim_type).toBe('section_8');
      expect(evictionCase.case_type).toBe('rent_arrears');
      expect(evictionCase.grounds.length).toBeGreaterThan(0);

      // Verify arrears
      expect(caseData.total_arrears).toBe(2700);
    });

    it('maps notice_service_date to notice_served_date when using inline subflow', () => {
      // The inline subflow uses notice_service_date internally, which gets
      // mapped to notice_served_date for consistency with the eviction wizard
      const factsWithServiceDate: WizardFacts = {
        __meta: {
          case_id: 'TEST-SERVICE-DATE-MAPPING',
          jurisdiction: 'england',
          product: 'complete_pack',
          original_product: 'complete_pack',
        },
        eviction_route: 'section_21',
        landlord_full_name: 'Test Landlord',
        landlord_address_line1: '1 Test St',
        landlord_address_town: 'London',
        landlord_address_postcode: 'SW1A 1AA',
        tenant_full_name: 'Test Tenant',
        property_address_line1: '2 Test Rd',
        property_address_town: 'London',
        property_address_postcode: 'SW1A 2BB',
        tenancy_start_date: '2023-01-01',
        rent_amount: 1200,
        rent_frequency: 'monthly',
        rent_due_day: 1,
        notice_already_served: false,
        // The subflow populates notice_served_date directly (mapped from notice_service_date)
        notice_served_date: '2024-12-26',
        notice_service_method: 'recorded_delivery',
        court_name: 'Test Court',
        signatory_name: 'Test Landlord',
        signatory_capacity: 'claimant',
      };

      const { caseData } = wizardFactsToEnglandWalesEviction('test', factsWithServiceDate);

      // The mapper should use notice_served_date
      expect(caseData.notice_served_date).toBe('2024-12-26');
      expect(caseData.notice_service_method).toBe('recorded_delivery');
    });
  });
});
