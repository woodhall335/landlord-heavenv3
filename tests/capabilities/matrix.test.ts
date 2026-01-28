import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import {
  assertFlowSupported,
  FlowCapabilityError,
  getCapabilityBuildReport,
  getCapabilityMatrix,
  getSupportedRoutes,
  isFlowSupported,
  normalizeProductSlug,
} from "../../src/lib/jurisdictions/capabilities/matrix";
import { writeCapabilityAlignmentReport } from "../../src/lib/jurisdictions/capabilities/alignmentReport";

const requiredJurisdictions = ["england", "wales", "scotland", "northern-ireland"] as const;

describe("capability matrix", () => {
  it("includes all jurisdictions", () => {
    const matrix = getCapabilityMatrix();
    for (const jurisdiction of requiredJurisdictions) {
      expect(matrix[jurisdiction], `missing ${jurisdiction}`).toBeDefined();
    }
  });

  it("enforces NI fail-closed for non-tenancy products", () => {
    expect(isFlowSupported("northern-ireland", "notice_only")).toBe(false);
    expect(isFlowSupported("northern-ireland", "eviction_pack")).toBe(false);
    expect(isFlowSupported("northern-ireland", "money_claim")).toBe(false);
    expect(isFlowSupported("northern-ireland", "tenancy_agreement")).toBe(true);
  });

  it("extracts known routes from MQS", () => {
    const englandRoutes = getSupportedRoutes("england", "notice_only");
    expect(englandRoutes).toContain("section_21");
    expect(englandRoutes).toContain("section_8");

    const walesRoutes = getSupportedRoutes("wales", "notice_only");
    expect(walesRoutes).toContain("wales_section_173");
  });

  it("links to real MQS files and template paths", () => {
    const matrix = getCapabilityMatrix();

    // Products that are England-only (not supported in Wales/Scotland)
    const englandOnlyProducts = ["eviction_pack", "money_claim"];

    for (const jurisdiction of requiredJurisdictions) {
      const products = matrix[jurisdiction];
      for (const [product, capability] of Object.entries(products)) {
        // Northern Ireland only supports tenancy_agreement
        if (jurisdiction === "northern-ireland" && product !== "tenancy_agreement") {
          expect(capability.status).toBe("unsupported");
          continue;
        }

        // Wales and Scotland don't support eviction_pack or money_claim (England only)
        if ((jurisdiction === "wales" || jurisdiction === "scotland") && englandOnlyProducts.includes(product)) {
          expect(capability.status).toBe("unsupported");
          continue;
        }

        if (!capability) continue;

        expect(capability.status).toBe("supported");
        expect(capability.routes.length).toBeGreaterThan(0);
        expect(capability.routes).not.toContain("default");
        expect(capability.templates.length).toBeGreaterThan(0);

        const mqsPath = path.join(process.cwd(), capability.derivedFrom.mqsFile ?? "");
        expect(fs.existsSync(mqsPath)).toBe(true);

        for (const template of capability.templates) {
          const fullTemplatePath = path.join(process.cwd(), "config", "jurisdictions", template);
          expect(fs.existsSync(fullTemplatePath)).toBe(true);
        }
      }
    }
  });

  it("fails closed at runtime for unsupported or misconfigured flows", () => {
    expect(() => assertFlowSupported("northern-ireland", "notice_only")).toThrow(FlowCapabilityError);
    try {
      assertFlowSupported("northern-ireland", "notice_only");
    } catch (error) {
      const err = error as FlowCapabilityError;
      expect(err.statusCode).toBe(422);
      expect(err.payload.code).toBe("FLOW_NOT_SUPPORTED");
      expect(err.payload.blocking_issues[0].code).toBe("FLOW_NOT_SUPPORTED");
    }

    const matrix = getCapabilityMatrix();
    const original = matrix.england.notice_only.status;
    matrix.england.notice_only.status = "misconfigured";
    expect(() => assertFlowSupported("england", "notice_only")).toThrow(FlowCapabilityError);
    try {
      assertFlowSupported("england", "notice_only");
    } catch (error) {
      const err = error as FlowCapabilityError;
      expect(err.payload.code).toBe("FLOW_MISCONFIGURED");
    }
    matrix.england.notice_only.status = original;
  });

  it("produces no misconfigured flows and writes alignment report", () => {
    const report = getCapabilityBuildReport();
    const matrix = getCapabilityMatrix();

    const misconfigured = report.misconfigured;
    expect(misconfigured, `Misconfigured flows: ${JSON.stringify(misconfigured, null, 2)}`).toHaveLength(0);
    expect(report.templateRegistryGaps, "Template registry gaps should be empty").toHaveLength(0);

    const outputPath = path.join(process.cwd(), "ALIGNMENT_REPORT.uk_packs.md");
    writeCapabilityAlignmentReport(matrix, report, outputPath);
    expect(fs.existsSync(outputPath)).toBe(true);
  });
});

describe("product alias normalization (complete_pack => eviction_pack)", () => {
  it("normalizes complete_pack to eviction_pack", () => {
    expect(normalizeProductSlug("complete_pack")).toBe("eviction_pack");
  });

  it("preserves valid product types unchanged", () => {
    expect(normalizeProductSlug("notice_only")).toBe("notice_only");
    expect(normalizeProductSlug("eviction_pack")).toBe("eviction_pack");
    expect(normalizeProductSlug("money_claim")).toBe("money_claim");
    expect(normalizeProductSlug("tenancy_agreement")).toBe("tenancy_agreement");
  });

  it("isFlowSupported accepts complete_pack as alias for eviction_pack", () => {
    // England should support both eviction_pack and complete_pack
    expect(isFlowSupported("england", "eviction_pack")).toBe(true);
    expect(isFlowSupported("england", "complete_pack")).toBe(true);

    // Wales should NOT support eviction_pack or complete_pack (England only)
    expect(isFlowSupported("wales", "eviction_pack")).toBe(false);
    expect(isFlowSupported("wales", "complete_pack")).toBe(false);

    // Scotland should NOT support eviction_pack or complete_pack (England only)
    expect(isFlowSupported("scotland", "eviction_pack")).toBe(false);
    expect(isFlowSupported("scotland", "complete_pack")).toBe(false);

    // Northern Ireland should NOT support eviction_pack or complete_pack
    expect(isFlowSupported("northern-ireland", "eviction_pack")).toBe(false);
    expect(isFlowSupported("northern-ireland", "complete_pack")).toBe(false);
  });

  it("getSupportedRoutes accepts complete_pack as alias", () => {
    const routesViaEvictionPack = getSupportedRoutes("england", "eviction_pack");
    const routesViaCompletePack = getSupportedRoutes("england", "complete_pack");

    expect(routesViaCompletePack).toEqual(routesViaEvictionPack);
    expect(routesViaCompletePack).toContain("section_8");
    expect(routesViaCompletePack).toContain("section_21");
  });

  it("assertFlowSupported does not throw FLOW_NOT_DEFINED for complete_pack", () => {
    // Should not throw for valid flows
    expect(() => assertFlowSupported("england", "complete_pack")).not.toThrow();
    expect(() => assertFlowSupported("england", "complete_pack", "section_8")).not.toThrow();
    expect(() => assertFlowSupported("england", "complete_pack", "section_21")).not.toThrow();

    // Should still throw for Northern Ireland
    expect(() => assertFlowSupported("northern-ireland", "complete_pack")).toThrow(FlowCapabilityError);
  });
});
