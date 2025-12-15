/**
 * API Enforcement Tests
 * CLAUDE CODE FIX #8: Uses explicit test execution pattern
 *
 * IMPORTANT: These are integration tests that require a running server.
 * Run with: npm run test:integration
 *
 * Setup:
 * 1. Start test server: npm run start:test
 * 2. Run tests: npm run test:integration
 */

import {
  createTestCase,
  cleanupTestCase,
  getTestBaseUrl,
  verifyTestEnvironment,
} from '@/lib/testing/wizard-test-helpers';

describe('API Enforcement - Real Pattern (Integration)', () => {
  let testCaseId: string;

  beforeAll(() => {
    verifyTestEnvironment();
  });

  afterEach(async () => {
    if (testCaseId) {
      await cleanupTestCase(testCaseId);
    }
  });

  // ========================================
  // WALES SECTION 173 TESTS
  // ========================================

  describe('Wales Section 173', () => {
    test('blocks Section 173 for supported_standard contracts', async () => {
      testCaseId = await createTestCase({
        selected_notice_route: 'wales_section_173',
        wales_contract_category: 'supported_standard',
      });

      const response = await fetch(`${getTestBaseUrl()}/api/wizard/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: testCaseId,
          documentType: 'wales_section_173',
        }),
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('WALES_SECTION173_INVALID_CONTRACT_TYPE');
    });

    test('blocks Section 173 for secure contracts', async () => {
      testCaseId = await createTestCase({
        selected_notice_route: 'wales_section_173',
        wales_contract_category: 'secure',
      });

      const response = await fetch(`${getTestBaseUrl()}/api/wizard/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: testCaseId,
          documentType: 'wales_section_173',
        }),
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('WALES_SECTION173_INVALID_CONTRACT_TYPE');
    });

    test('blocks Section 173 without Rent Smart Wales registration', async () => {
      testCaseId = await createTestCase({
        selected_notice_route: 'wales_section_173',
        wales_contract_category: 'standard',
        rent_smart_wales_registered: false,
      });

      const response = await fetch(`${getTestBaseUrl()}/api/wizard/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: testCaseId,
          documentType: 'wales_section_173',
        }),
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('WALES_RENT_SMART_REQUIRED');
    });

    test('blocks Section 173 with unprotected deposit', async () => {
      testCaseId = await createTestCase({
        selected_notice_route: 'wales_section_173',
        wales_contract_category: 'standard',
        rent_smart_wales_registered: true,
        deposit_taken: true,
        deposit_protected: false,
      });

      const response = await fetch(`${getTestBaseUrl()}/api/wizard/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: testCaseId,
          documentType: 'wales_section_173',
        }),
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('WALES_DEPOSIT_NOT_PROTECTED');
    });

    test('allows Section 173 for standard contract with compliance', async () => {
      testCaseId = await createTestCase({
        selected_notice_route: 'wales_section_173',
        wales_contract_category: 'standard',
        rent_smart_wales_registered: true,
        deposit_taken: false,
      });

      const response = await fetch(`${getTestBaseUrl()}/api/wizard/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: testCaseId,
          documentType: 'wales_section_173',
        }),
      });

      expect(response.status).not.toBe(403);
    });
  });

  // ========================================
  // ENGLAND SECTION 21 TESTS (WITH APPLICABILITY)
  // ========================================

  describe('England Section 21 - Applicability Aware', () => {
    test('blocks S21 with unprotected deposit (deposit taken)', async () => {
      testCaseId = await createTestCase({
        selected_notice_route: 'section_21',
        deposit_taken: true,
        deposit_protected: false,
        has_gas_appliances: false,
        epc_provided: true,
        property_licensing_status: 'not_required',
        tenancy_start_date: '2016-01-01',
      });

      const response = await fetch(`${getTestBaseUrl()}/api/wizard/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: testCaseId,
          documentType: 'section21_notice',
        }),
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('SECTION21_DEPOSIT_NOT_PROTECTED');
    });

    test('blocks S21 without prescribed info (deposit taken) - FIX #4', async () => {
      testCaseId = await createTestCase({
        selected_notice_route: 'section_21',
        deposit_taken: true,
        deposit_protected: true,
        prescribed_info_given: false, // Missing prescribed info
        has_gas_appliances: false,
        epc_provided: true,
        property_licensing_status: 'not_required',
        tenancy_start_date: '2016-01-01',
      });

      const response = await fetch(`${getTestBaseUrl()}/api/wizard/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: testCaseId,
          documentType: 'section21_notice',
        }),
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('SECTION21_PRESCRIBED_INFO_MISSING');
    });

    test('allows S21 without deposit checks (no deposit taken)', async () => {
      testCaseId = await createTestCase({
        selected_notice_route: 'section_21',
        deposit_taken: false, // No deposit, so no protection/prescribed info needed
        has_gas_appliances: false,
        epc_provided: true,
        property_licensing_status: 'not_required',
        tenancy_start_date: '2016-01-01',
      });

      const response = await fetch(`${getTestBaseUrl()}/api/wizard/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: testCaseId,
          documentType: 'section21_notice',
        }),
      });

      expect(response.status).not.toBe(403);
    });

    test('blocks S21 without gas cert (gas appliances present)', async () => {
      testCaseId = await createTestCase({
        selected_notice_route: 'section_21',
        deposit_taken: false,
        has_gas_appliances: true,
        gas_certificate_provided: false,
        epc_provided: true,
        property_licensing_status: 'not_required',
        tenancy_start_date: '2016-01-01',
      });

      const response = await fetch(`${getTestBaseUrl()}/api/wizard/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: testCaseId,
          documentType: 'section21_notice',
        }),
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('SECTION21_GAS_CERTIFICATE_MISSING');
    });

    test('allows S21 without gas cert (no gas appliances)', async () => {
      testCaseId = await createTestCase({
        selected_notice_route: 'section_21',
        deposit_taken: false,
        has_gas_appliances: false, // No gas appliances
        epc_provided: true,
        property_licensing_status: 'not_required',
        tenancy_start_date: '2016-01-01',
      });

      const response = await fetch(`${getTestBaseUrl()}/api/wizard/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: testCaseId,
          documentType: 'section21_notice',
        }),
      });

      expect(response.status).not.toBe(403);
    });

    test('blocks S21 without How to Rent (tenancy after Oct 2015) - FIX #5', async () => {
      testCaseId = await createTestCase({
        selected_notice_route: 'section_21',
        tenancy_start_date: '2016-01-01', // After Oct 1, 2015
        how_to_rent_provided: false,
        deposit_taken: false,
        has_gas_appliances: false,
        epc_provided: true,
        property_licensing_status: 'not_required',
      });

      const response = await fetch(`${getTestBaseUrl()}/api/wizard/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: testCaseId,
          documentType: 'section21_notice',
        }),
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('SECTION21_HOW_TO_RENT_MISSING');
    });

    test('allows S21 without How to Rent (tenancy before Oct 2015) - FIX #5', async () => {
      testCaseId = await createTestCase({
        selected_notice_route: 'section_21',
        tenancy_start_date: '2015-09-01', // Before Oct 1, 2015
        how_to_rent_provided: false,
        deposit_taken: false,
        has_gas_appliances: false,
        epc_provided: true,
        property_licensing_status: 'not_required',
      });

      const response = await fetch(`${getTestBaseUrl()}/api/wizard/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: testCaseId,
          documentType: 'section21_notice',
        }),
      });

      expect(response.status).not.toBe(403);
    });

    test('blocks S21 without EPC - FIX #6 (product constraint)', async () => {
      testCaseId = await createTestCase({
        selected_notice_route: 'section_21',
        deposit_taken: false,
        has_gas_appliances: false,
        epc_provided: false, // Missing EPC
        property_licensing_status: 'not_required',
        tenancy_start_date: '2016-01-01',
      });

      const response = await fetch(`${getTestBaseUrl()}/api/wizard/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: testCaseId,
          documentType: 'section21_notice',
        }),
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('SECTION21_EPC_MISSING');
    });

    test('blocks S21 for unlicensed property', async () => {
      testCaseId = await createTestCase({
        selected_notice_route: 'section_21',
        deposit_taken: false,
        has_gas_appliances: false,
        epc_provided: true,
        property_licensing_status: 'unlicensed',
        tenancy_start_date: '2016-01-01',
      });

      const response = await fetch(`${getTestBaseUrl()}/api/wizard/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: testCaseId,
          documentType: 'section21_notice',
        }),
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('SECTION21_UNLICENSED_PROPERTY');
    });

    test('blocks S21 with recent repair complaints', async () => {
      testCaseId = await createTestCase({
        selected_notice_route: 'section_21',
        deposit_taken: false,
        has_gas_appliances: false,
        epc_provided: true,
        property_licensing_status: 'not_required',
        tenancy_start_date: '2016-01-01',
        recent_repair_complaints: true,
      });

      const response = await fetch(`${getTestBaseUrl()}/api/wizard/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: testCaseId,
          documentType: 'section21_notice',
        }),
      });

      expect(response.status).toBe(403);
      const data = await response.json();
      expect(data.error).toBe('SECTION21_RETALIATORY_EVICTION');
    });

    test('allows fully compliant Section 21', async () => {
      testCaseId = await createTestCase({
        selected_notice_route: 'section_21',
        deposit_taken: true,
        deposit_protected: true,
        prescribed_info_given: true,
        has_gas_appliances: true,
        gas_certificate_provided: true,
        epc_provided: true,
        property_licensing_status: 'licensed',
        tenancy_start_date: '2016-01-01',
        how_to_rent_provided: true,
        recent_repair_complaints: false,
      });

      const response = await fetch(`${getTestBaseUrl()}/api/wizard/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: testCaseId,
          documentType: 'section21_notice',
        }),
      });

      expect(response.status).toBe(200);
    });
  });
});
