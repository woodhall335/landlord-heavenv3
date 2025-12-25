/**
 * England Complete Pack Data Flow Tests
 *
 * Tests that MQS facts flow correctly through to CaseData for N5, N5B, and N119 forms.
 * This ensures the court-ready pack has all required fields populated.
 */

import { describe, expect, it } from "vitest";
import { wizardFactsToEnglandWalesEviction } from "../../src/lib/documents/eviction-wizard-mapper";
import type { CaseData } from "../../src/lib/documents/official-forms-filler";

describe("England Complete Pack Data Flow", () => {
  describe("Section 8 Route (Rent Arrears)", () => {
    const section8WizardFacts = {
      // Route selection
      eviction_route: "Section 8 (fault-based)",
      selected_notice_route: "section_8",

      // Notice service details (from MQS)
      notice_served_date: "2025-12-01",
      notice_expiry_date: "2025-12-15",

      // Rent details (from MQS)
      rent_amount: 1500,
      rent_frequency: "monthly",

      // Arrears details (from MQS)
      total_arrears: 4500,
      arrears_at_notice_date: 3000,

      // Section 8 grounds
      section8_grounds: ["Ground 8 - 8+ weeks rent arrears", "Ground 10 - Rent arrears"],
      section8_details: "Tenant has not paid rent for 3 months.",

      // Property
      property_address_line1: "123 Test Street",
      property_address_town: "London",
      property_address_postcode: "SW1A 1AA",

      // Tenant
      tenant_full_name: "John Tenant",
      tenant_email: "john@tenant.com",

      // Landlord
      landlord_full_name: "Jane Landlord",
      landlord_address_line1: "456 Owner Road",
      landlord_address_town: "Manchester",
      landlord_address_postcode: "M1 1AA",

      // Tenancy
      tenancy_start_date: "2023-01-01",
    };

    it("maps notice_served_date to CaseData for N5", () => {
      const { caseData } = wizardFactsToEnglandWalesEviction("test-case-1", section8WizardFacts);

      expect(caseData.notice_served_date).toBe("2025-12-01");
      expect(caseData.section_8_notice_date).toBe("2025-12-01");
    });

    it("maps total_arrears to CaseData for N5 and N119", () => {
      const { caseData } = wizardFactsToEnglandWalesEviction("test-case-2", section8WizardFacts);

      expect(caseData.total_arrears).toBe(4500);
      expect(caseData.arrears_at_notice_date).toBe(3000);
    });

    it("maps rent details to CaseData for N119", () => {
      const { caseData } = wizardFactsToEnglandWalesEviction("test-case-3", section8WizardFacts);

      expect(caseData.rent_amount).toBe(1500);
      expect(caseData.rent_frequency).toBe("monthly");
    });

    it("maps notice_expiry_date to CaseData", () => {
      const { caseData } = wizardFactsToEnglandWalesEviction("test-case-4", section8WizardFacts);

      expect(caseData.notice_expiry_date).toBe("2025-12-15");
    });

    it("sets claim_type to section_8", () => {
      const { caseData } = wizardFactsToEnglandWalesEviction("test-case-5", section8WizardFacts);

      expect(caseData.claim_type).toBe("section_8");
    });

    it("maps ground codes for N5 and N119", () => {
      const { caseData } = wizardFactsToEnglandWalesEviction("test-case-6", section8WizardFacts);

      expect(caseData.ground_codes).toContain("8");
      expect(caseData.ground_codes).toContain("10");
      expect(caseData.ground_numbers).toBe("8, 10");
    });
  });

  describe("Section 21 Route (No-Fault)", () => {
    const section21WizardFacts = {
      // Route selection
      eviction_route: "Section 21 (no-fault)",
      selected_notice_route: "section_21",

      // Notice service details (from MQS)
      notice_served_date: "2025-11-01",
      notice_expiry_date: "2026-01-01",

      // Rent details (from MQS)
      rent_amount: 1200,
      rent_frequency: "monthly",

      // Section 21 compliance
      deposit_protected: true,
      prescribed_info_served: true,
      how_to_rent_served: true,
      epc_gas_cert_served: true,
      no_retaliatory_notice: true,

      // Deposit details (from MQS) - needed for N5B
      deposit_amount: 1200,
      deposit_protection_date: "2023-01-15",
      deposit_scheme_name: "DPS",
      deposit_reference: "DEP123456",

      // Property
      property_address_line1: "789 Rental Lane",
      property_address_town: "Birmingham",
      property_address_postcode: "B1 1AA",

      // Tenant
      tenant_full_name: "Alice Renter",

      // Landlord
      landlord_full_name: "Bob Owner",
      landlord_address_line1: "321 Property Street",
      landlord_address_town: "Leeds",
      landlord_address_postcode: "LS1 1AA",

      // Tenancy
      tenancy_start_date: "2023-01-01",
    };

    it("maps notice dates to CaseData for N5B", () => {
      const { caseData } = wizardFactsToEnglandWalesEviction("test-case-7", section21WizardFacts);

      expect(caseData.notice_served_date).toBe("2025-11-01");
      expect(caseData.section_21_notice_date).toBe("2025-11-01");
      expect(caseData.notice_expiry_date).toBe("2026-01-01");
    });

    it("maps deposit details to CaseData for N5B", () => {
      const { caseData } = wizardFactsToEnglandWalesEviction("test-case-8", section21WizardFacts);

      expect(caseData.deposit_amount).toBe(1200);
      expect(caseData.deposit_protection_date).toBe("2023-01-15");
      expect(caseData.deposit_scheme).toBe("DPS");
      expect(caseData.deposit_reference).toBe("DEP123456");
    });

    it("sets claim_type to section_21", () => {
      const { caseData } = wizardFactsToEnglandWalesEviction("test-case-9", section21WizardFacts);

      expect(caseData.claim_type).toBe("section_21");
    });
  });

  describe("Common Fields", () => {
    const commonWizardFacts = {
      selected_notice_route: "section_8",
      notice_served_date: "2025-12-01",
      property_address_line1: "123 Test Street",
      property_address_town: "London",
      property_address_postcode: "SW1A 1AA",
      tenant_full_name: "John Tenant",
      landlord_full_name: "Jane Landlord",
      landlord_address_line1: "456 Owner Road",
      landlord_address_town: "Manchester",
      landlord_address_postcode: "M1 1AA",
      tenancy_start_date: "2023-01-01",
      rent_amount: 1500,
      rent_frequency: "monthly",
    };

    it("maps property address correctly", () => {
      const { caseData } = wizardFactsToEnglandWalesEviction("test-case-10", commonWizardFacts);

      expect(caseData.property_address).toContain("123 Test Street");
      expect(caseData.property_postcode).toBe("SW1A 1AA");
    });

    it("maps landlord details correctly", () => {
      const { caseData } = wizardFactsToEnglandWalesEviction("test-case-11", commonWizardFacts);

      expect(caseData.landlord_full_name).toBe("Jane Landlord");
      expect(caseData.landlord_address).toContain("456 Owner Road");
    });

    it("maps tenant details correctly", () => {
      const { caseData } = wizardFactsToEnglandWalesEviction("test-case-12", commonWizardFacts);

      expect(caseData.tenant_full_name).toBe("John Tenant");
    });

    it("maps tenancy start date correctly", () => {
      const { caseData } = wizardFactsToEnglandWalesEviction("test-case-13", commonWizardFacts);

      expect(caseData.tenancy_start_date).toBe("2023-01-01");
    });

    it("passes court_name from wizard facts when provided", () => {
      const factsWithCourt = {
        ...commonWizardFacts,
        court_name: "Manchester County Court",
        court_address: "1 Bridge Street West, Manchester, M60 9DJ",
      };
      const { caseData } = wizardFactsToEnglandWalesEviction("test-case-14", factsWithCourt);

      expect(caseData.court_name).toBe("Manchester County Court");
      expect(caseData.court_address).toBe("1 Bridge Street West, Manchester, M60 9DJ");
    });

    it("leaves court_name undefined when not provided (no fallback)", () => {
      const { caseData } = wizardFactsToEnglandWalesEviction("test-case-14b", commonWizardFacts);

      // Court name should be undefined - no hardcoded defaults
      // The gating system will block generation if court details are required but missing
      expect(caseData.court_name).toBeUndefined();
    });

    it("sets signatory_name to landlord name", () => {
      const { caseData } = wizardFactsToEnglandWalesEviction("test-case-15", commonWizardFacts);

      expect(caseData.signatory_name).toBe("Jane Landlord");
    });

    it("sets signature_date to current date", () => {
      const { caseData } = wizardFactsToEnglandWalesEviction("test-case-16", commonWizardFacts);

      expect(caseData.signature_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
});
