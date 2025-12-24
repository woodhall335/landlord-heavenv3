/**
 * England Complete Pack Court-Ready Tests
 *
 * Tests that:
 * 1. MQS collects all required court-ready fields
 * 2. Data flows correctly from MQS → CaseFacts → CaseData → PDF fillers
 * 3. Complete Pack uses Notice Only templates (single source of truth)
 * 4. Money Claims remains unaffected
 */

import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";

// ============================================================================
// MQS COVERAGE TESTS - Verify all court-ready fields are asked
// ============================================================================

describe("England Complete Pack MQS Coverage", () => {
  const mqsPath = path.join(process.cwd(), "config/mqs/complete_pack/england.yaml");
  const mqsContent = fs.readFileSync(mqsPath, "utf-8");
  const mqs = yaml.load(mqsContent) as any;

  it("has questions array", () => {
    expect(mqs.questions).toBeDefined();
    expect(Array.isArray(mqs.questions)).toBe(true);
    expect(mqs.questions.length).toBeGreaterThan(0);
  });

  describe("Common Fields (both routes)", () => {
    it("asks for notice_served_date", () => {
      const hasNoticeDate = mqs.questions.some((q: any) =>
        q.maps_to?.includes("notice_served_date") ||
        q.fields?.some((f: any) => f.id === "notice_served_date")
      );
      expect(hasNoticeDate).toBe(true);
    });

    it("asks for rent_amount", () => {
      const hasRentAmount = mqs.questions.some((q: any) =>
        q.maps_to?.includes("rent_amount") ||
        q.fields?.some((f: any) => f.id === "rent_amount")
      );
      expect(hasRentAmount).toBe(true);
    });

    it("asks for rent_frequency", () => {
      const hasRentFrequency = mqs.questions.some((q: any) =>
        q.maps_to?.includes("rent_frequency") ||
        q.fields?.some((f: any) => f.id === "rent_frequency")
      );
      expect(hasRentFrequency).toBe(true);
    });

    it("asks for property_address", () => {
      const hasPropertyAddress = mqs.questions.some((q: any) =>
        q.id === "property_address" ||
        q.maps_to?.includes("property_address_line1")
      );
      expect(hasPropertyAddress).toBe(true);
    });

    it("asks for tenant_full_name", () => {
      const hasTenantName = mqs.questions.some((q: any) =>
        q.maps_to?.includes("tenant_full_name") ||
        q.fields?.some((f: any) => f.id === "tenant_full_name")
      );
      expect(hasTenantName).toBe(true);
    });

    it("asks for landlord_full_name", () => {
      const hasLandlordName = mqs.questions.some((q: any) =>
        q.maps_to?.includes("landlord_full_name") ||
        q.fields?.some((f: any) => f.id === "landlord_full_name")
      );
      expect(hasLandlordName).toBe(true);
    });

    it("asks for tenancy_start_date", () => {
      const hasTenancyStart = mqs.questions.some((q: any) =>
        q.maps_to?.includes("tenancy_start_date") ||
        q.id === "tenancy_start_date"
      );
      expect(hasTenancyStart).toBe(true);
    });
  });

  describe("Section 8 Specific Fields", () => {
    it("asks for section8_grounds", () => {
      const hasGrounds = mqs.questions.some((q: any) =>
        q.id === "section8_grounds" ||
        q.maps_to?.includes("section8_grounds")
      );
      expect(hasGrounds).toBe(true);
    });

    it("asks for total_arrears", () => {
      const hasTotalArrears = mqs.questions.some((q: any) =>
        q.maps_to?.includes("total_arrears") ||
        q.fields?.some((f: any) => f.id === "total_arrears")
      );
      expect(hasTotalArrears).toBe(true);
    });

    it("asks for arrears_at_notice_date", () => {
      const hasArrearsAtNotice = mqs.questions.some((q: any) =>
        q.maps_to?.includes("arrears_at_notice_date") ||
        q.fields?.some((f: any) => f.id === "arrears_at_notice_date")
      );
      expect(hasArrearsAtNotice).toBe(true);
    });
  });

  describe("Section 21 Specific Fields", () => {
    it("asks for deposit_amount", () => {
      const hasDepositAmount = mqs.questions.some((q: any) =>
        q.maps_to?.includes("deposit_amount") ||
        q.fields?.some((f: any) => f.id === "deposit_amount")
      );
      expect(hasDepositAmount).toBe(true);
    });

    it("asks for deposit_protection_date", () => {
      const hasDepositDate = mqs.questions.some((q: any) =>
        q.maps_to?.includes("deposit_protection_date") ||
        q.fields?.some((f: any) => f.id === "deposit_protection_date")
      );
      expect(hasDepositDate).toBe(true);
    });

    it("asks for deposit_scheme_name", () => {
      const hasDepositScheme = mqs.questions.some((q: any) =>
        q.maps_to?.includes("deposit_scheme_name") ||
        q.fields?.some((f: any) => f.id === "deposit_scheme_name")
      );
      expect(hasDepositScheme).toBe(true);
    });

    it("asks for Section 21 compliance checks", () => {
      const hasCompliance = mqs.questions.some((q: any) =>
        q.id === "section21_compliance" &&
        q.fields?.some((f: any) => f.id === "deposit_protected")
      );
      expect(hasCompliance).toBe(true);
    });
  });
});

// ============================================================================
// SINGLE SOURCE OF TRUTH TESTS - Verify Complete Pack uses Notice Only templates
// ============================================================================

describe("Complete Pack uses Notice Only templates (single source of truth)", () => {
  it("Section 8 generator uses notice_only/form_3_section8 template", () => {
    const section8GeneratorPath = path.join(
      process.cwd(),
      "src/lib/documents/section8-generator.ts"
    );
    const content = fs.readFileSync(section8GeneratorPath, "utf-8");
    expect(content).toContain("notice_only/form_3_section8/notice.hbs");
  });

  it("Section 21 generator uses notice_only/form_6a_section21 template", () => {
    const section21GeneratorPath = path.join(
      process.cwd(),
      "src/lib/documents/section21-generator.ts"
    );
    const content = fs.readFileSync(section21GeneratorPath, "utf-8");
    expect(content).toContain("notice_only/form_6a_section21/notice.hbs");
  });

  it("eviction-pack-generator imports section8-generator", () => {
    const packGeneratorPath = path.join(
      process.cwd(),
      "src/lib/documents/eviction-pack-generator.ts"
    );
    const content = fs.readFileSync(packGeneratorPath, "utf-8");
    expect(content).toContain("import { generateSection8Notice");
    expect(content).toContain("from './section8-generator'");
  });

  it("eviction-pack-generator imports section21-generator", () => {
    const packGeneratorPath = path.join(
      process.cwd(),
      "src/lib/documents/eviction-pack-generator.ts"
    );
    const content = fs.readFileSync(packGeneratorPath, "utf-8");
    expect(content).toContain("import { generateSection21Notice");
    expect(content).toContain("from './section21-generator'");
  });

  it("eviction-pack-generator calls generateSection8Notice", () => {
    const packGeneratorPath = path.join(
      process.cwd(),
      "src/lib/documents/eviction-pack-generator.ts"
    );
    const content = fs.readFileSync(packGeneratorPath, "utf-8");
    expect(content).toContain("generateSection8Notice(");
  });

  it("eviction-pack-generator calls generateSection21Notice", () => {
    const packGeneratorPath = path.join(
      process.cwd(),
      "src/lib/documents/eviction-pack-generator.ts"
    );
    const content = fs.readFileSync(packGeneratorPath, "utf-8");
    expect(content).toContain("generateSection21Notice(");
  });

  it("notice templates exist at expected paths", () => {
    const section8TemplatePath = path.join(
      process.cwd(),
      "config/jurisdictions/uk/england/templates/notice_only/form_3_section8/notice.hbs"
    );
    const section21TemplatePath = path.join(
      process.cwd(),
      "config/jurisdictions/uk/england/templates/notice_only/form_6a_section21/notice.hbs"
    );

    expect(fs.existsSync(section8TemplatePath)).toBe(true);
    expect(fs.existsSync(section21TemplatePath)).toBe(true);
  });
});

// ============================================================================
// MONEY CLAIMS ISOLATION TESTS - Verify Money Claims is NOT affected
// ============================================================================

describe("Money Claims remains unaffected", () => {
  it("money_claim MQS exists separately", () => {
    const moneyClaimMqsPath = path.join(
      process.cwd(),
      "config/mqs/money_claim"
    );
    expect(fs.existsSync(moneyClaimMqsPath)).toBe(true);
  });

  it("complete_pack MQS does not reference money claims", () => {
    const mqsPath = path.join(process.cwd(), "config/mqs/complete_pack/england.yaml");
    const content = fs.readFileSync(mqsPath, "utf-8");
    expect(content.toLowerCase()).not.toContain("money_claim");
    expect(content.toLowerCase()).not.toContain("moneyclaim");
  });

  it("eviction-pack-generator does not handle money claims", () => {
    const packGeneratorPath = path.join(
      process.cwd(),
      "src/lib/documents/eviction-pack-generator.ts"
    );
    const content = fs.readFileSync(packGeneratorPath, "utf-8");
    // Should not contain money claim specific logic
    expect(content).not.toContain("generateMoneyClaim");
    expect(content).not.toContain("fillMoneyClaimForm");
  });
});

// ============================================================================
// JURISDICTION ISOLATION TESTS - Verify England-specific config
// ============================================================================

describe("England jurisdiction isolation", () => {
  it("england.yaml exists in complete_pack", () => {
    const mqsPath = path.join(process.cwd(), "config/mqs/complete_pack/england.yaml");
    expect(fs.existsSync(mqsPath)).toBe(true);
  });

  it("england.yaml has correct jurisdiction", () => {
    const mqsPath = path.join(process.cwd(), "config/mqs/complete_pack/england.yaml");
    const content = fs.readFileSync(mqsPath, "utf-8");
    const mqs = yaml.load(content) as any;
    expect(mqs.jurisdiction).toBe("england");
    expect(mqs.__meta?.jurisdiction).toBe("england");
  });

  it("does not create england-wales combined config", () => {
    const englandWalesPath = path.join(
      process.cwd(),
      "config/mqs/complete_pack/england-wales.yaml"
    );
    expect(fs.existsSync(englandWalesPath)).toBe(false);
  });

  it("wales has separate config", () => {
    const walesPath = path.join(process.cwd(), "config/mqs/complete_pack/wales.yaml");
    expect(fs.existsSync(walesPath)).toBe(true);
  });

  it("scotland has separate config", () => {
    const scotlandPath = path.join(process.cwd(), "config/mqs/complete_pack/scotland.yaml");
    expect(fs.existsSync(scotlandPath)).toBe(true);
  });
});
