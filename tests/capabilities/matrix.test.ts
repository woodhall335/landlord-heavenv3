import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import { getCapabilityMatrix, getSupportedRoutes, isFlowSupported } from "../../src/lib/jurisdictions/capabilities/matrix";

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

    for (const jurisdiction of requiredJurisdictions) {
      const products = matrix[jurisdiction];
      for (const [product, capability] of Object.entries(products)) {
        if (jurisdiction === "northern-ireland" && product !== "tenancy_agreement") {
          expect(capability).toBeNull();
          continue;
        }
        if (!capability) continue;

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
});
