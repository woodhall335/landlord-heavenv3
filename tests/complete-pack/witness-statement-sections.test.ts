/**
 * Witness Statement Sections Tests
 *
 * Tests the deterministic witness statement generation for Section 8 eviction cases.
 * Uses the golden fixture: tests/fixtures/complete-pack/england.section8.ground8.case.json
 *
 * Requirements tested:
 * 1. Claimant and Defendant names appear
 * 2. "I, <name>, of <address>" line is populated (via template)
 * 3. "Claim No:" line is present and EMPTY
 * 4. All 5 sections contain non-empty narrative text
 * 5. Supporting Evidence section does not falsely claim uploads
 */

import { describe, expect, it, beforeAll } from "vitest";
import fs from "fs";
import path from "path";
import {
  buildWitnessStatementSections,
  extractWitnessStatementSectionsInput,
  type WitnessStatementSectionsInput,
} from "../../src/lib/documents/witness-statement-sections";

// Load golden fixture
const fixturePath = path.join(
  process.cwd(),
  "tests/fixtures/complete-pack/england.section8.ground8.case.json"
);
const goldenFixture = JSON.parse(fs.readFileSync(fixturePath, "utf-8"));

describe("Witness Statement Sections Builder", () => {
  describe("extractWitnessStatementSectionsInput", () => {
    it("correctly extracts landlord information from fixture", () => {
      const input = extractWitnessStatementSectionsInput(goldenFixture);

      expect(input.landlord.full_name).toBe("Tariq Mohammed");
      expect(input.landlord.address_line_1).toBe("35 Woodhall Park Avenue");
      expect(input.landlord.city).toBe("Pudsey");
      expect(input.landlord.postcode).toBe("LS28 7HF");
    });

    it("correctly extracts tenant information from fixture", () => {
      const input = extractWitnessStatementSectionsInput(goldenFixture);

      expect(input.tenant.full_name).toBe("Sonia Shezadi");
    });

    it("correctly extracts property information from fixture", () => {
      const input = extractWitnessStatementSectionsInput(goldenFixture);

      expect(input.property.address_line_1).toBe("16 Waterloo Road");
      expect(input.property.city).toBe("Pudsey");
      expect(input.property.postcode).toBe("LS28 7PW");
    });

    it("correctly extracts tenancy information from fixture", () => {
      const input = extractWitnessStatementSectionsInput(goldenFixture);

      expect(input.tenancy.start_date).toBe("2025-07-14");
      expect(input.tenancy.tenancy_type).toBe("ast_fixed_term");
      expect(input.tenancy.fixed_term_end_date).toBe("2026-07-14");
      expect(input.tenancy.rent_amount).toBe(1000.01);
      expect(input.tenancy.rent_frequency).toBe("monthly");
      expect(input.tenancy.rent_due_day).toBe(1);
    });

    it("correctly extracts notice information from fixture", () => {
      const input = extractWitnessStatementSectionsInput(goldenFixture);

      expect(input.notice.served_date).toBe("2026-01-19");
      expect(input.notice.service_method).toBe("first_class_post");
      expect(input.notice.expiry_date).toBe("2026-02-02");
    });

    it("correctly extracts section8 grounds from fixture", () => {
      const input = extractWitnessStatementSectionsInput(goldenFixture);

      expect(input.section8.grounds).toContain("ground_8");
    });

    it("correctly extracts arrears information from fixture", () => {
      const input = extractWitnessStatementSectionsInput(goldenFixture);

      expect(input.arrears?.total_arrears).toBe(7000.07);
      expect(input.arrears?.arrears_months).toBe(7.0);
      expect(input.arrears?.items?.length).toBe(7);
    });

    it("correctly extracts signing information from fixture", () => {
      const input = extractWitnessStatementSectionsInput(goldenFixture);

      expect(input.signing?.signatory_name).toBe("Tariq Mohammed");
      expect(input.signing?.signature_date).toBe("2026-01-19");
    });

    it("correctly extracts empty evidence_uploads from fixture", () => {
      const input = extractWitnessStatementSectionsInput(goldenFixture);

      expect(input.evidence_uploads).toEqual([]);
    });
  });

  describe("buildWitnessStatementSections", () => {
    let input: WitnessStatementSectionsInput;
    let sections: ReturnType<typeof buildWitnessStatementSections>;

    beforeAll(() => {
      input = extractWitnessStatementSectionsInput(goldenFixture);
      sections = buildWitnessStatementSections(input);
    });

    describe("Section 1: Introduction", () => {
      it("contains non-empty introduction text", () => {
        expect(sections.introduction).toBeTruthy();
        expect(sections.introduction.length).toBeGreaterThan(50);
      });

      it("mentions landlord identity", () => {
        expect(sections.introduction).toContain("landlord");
      });

      it("mentions property address", () => {
        expect(sections.introduction).toContain("16 Waterloo Road");
      });

      it("mentions Section 8 and Housing Act 1988", () => {
        expect(sections.introduction).toContain("section 8");
        expect(sections.introduction).toContain("Housing Act 1988");
      });

      it("states the purpose of the statement", () => {
        expect(sections.introduction).toContain("possession");
      });
    });

    describe("Section 2: Tenancy History", () => {
      it("contains non-empty tenancy history text", () => {
        expect(sections.tenancy_history).toBeTruthy();
        expect(sections.tenancy_history.length).toBeGreaterThan(50);
      });

      it("mentions tenancy start date in UK format", () => {
        // 2025-07-14 should be formatted as "14 July 2025"
        expect(sections.tenancy_history).toContain("14 July 2025");
      });

      it("mentions tenancy type", () => {
        expect(sections.tenancy_history).toContain("assured shorthold tenancy");
      });

      it("mentions fixed term end date", () => {
        expect(sections.tenancy_history).toContain("14 July 2026");
      });

      it("mentions rent amount", () => {
        expect(sections.tenancy_history).toContain("£1,000.01");
      });

      it("mentions rent frequency", () => {
        expect(sections.tenancy_history).toContain("monthly");
      });

      it("mentions rent due day", () => {
        expect(sections.tenancy_history).toContain("1st");
      });

      it("mentions tenant's obligation to pay rent", () => {
        expect(sections.tenancy_history).toContain("obligated to pay rent");
      });
    });

    describe("Section 3: Grounds for Possession", () => {
      it("contains non-empty grounds summary text", () => {
        expect(sections.grounds_summary).toBeTruthy();
        expect(sections.grounds_summary.length).toBeGreaterThan(100);
      });

      it("mentions Ground 8", () => {
        expect(sections.grounds_summary).toContain("Ground 8");
      });

      it("mentions Housing Act 1988 Schedule 2", () => {
        expect(sections.grounds_summary).toContain("Schedule 2");
        expect(sections.grounds_summary).toContain("Housing Act 1988");
      });

      it("explains Ground 8 is mandatory", () => {
        expect(sections.grounds_summary).toContain("mandatory ground");
      });

      it("correctly phrases Ground 8 requirements (no certainty about hearing)", () => {
        expect(sections.grounds_summary).toContain(
          "at least two months' rent"
        );
        // Should NOT assert certainty about hearing outcome
        expect(sections.grounds_summary.toLowerCase()).not.toContain("will be ordered");
        expect(sections.grounds_summary.toLowerCase()).not.toContain("must grant");
      });

      it("mentions current arrears total", () => {
        expect(sections.grounds_summary).toContain("£7,000.07");
      });

      it("mentions approximate months of arrears", () => {
        expect(sections.grounds_summary).toContain("7 months");
      });

      it("refers to Schedule of Arrears", () => {
        expect(sections.grounds_summary).toContain("Schedule of Arrears");
      });
    });

    describe("Section 4: Timeline of Events", () => {
      it("contains non-empty timeline text", () => {
        expect(sections.timeline).toBeTruthy();
        expect(sections.timeline.length).toBeGreaterThan(100);
      });

      it("is formatted as bullet points", () => {
        expect(sections.timeline).toContain("•");
      });

      it("mentions tenancy commencement date", () => {
        expect(sections.timeline).toContain("14 July 2025");
        expect(sections.timeline).toContain("Tenancy commenced");
      });

      it("mentions earliest arrears period", () => {
        expect(sections.timeline).toContain("unpaid rent");
      });

      it("mentions notice served date with method", () => {
        expect(sections.timeline).toContain("19 January 2026");
        expect(sections.timeline).toContain("Section 8 Notice served");
        expect(sections.timeline).toContain("first class post");
      });

      it("mentions notice expiry date", () => {
        expect(sections.timeline).toContain("2 February 2026");
        expect(sections.timeline).toContain("expired");
      });

      it("events are in chronological order", () => {
        const lines = sections.timeline.split("\n");
        const dates = lines
          .map((line) => {
            const match = line.match(/(\d{1,2} \w+ \d{4})/);
            return match ? new Date(match[1]).getTime() : null;
          })
          .filter((d) => d !== null);

        // Verify dates are in ascending order
        for (let i = 1; i < dates.length; i++) {
          expect(dates[i]).toBeGreaterThanOrEqual(dates[i - 1]!);
        }
      });
    });

    describe("Section 5: Supporting Evidence", () => {
      it("contains non-empty evidence references text", () => {
        expect(sections.evidence_references).toBeTruthy();
        expect(sections.evidence_references.length).toBeGreaterThan(100);
      });

      it("mentions Schedule of Arrears as attached", () => {
        expect(sections.evidence_references).toContain("Schedule of Arrears");
      });

      it("mentions Section 8 Notice as attached", () => {
        expect(sections.evidence_references).toContain("Section 8 Notice");
      });

      it("mentions Proof of Service as attached", () => {
        expect(sections.evidence_references).toContain("Proof of Service");
      });

      it("does NOT falsely claim evidence_uploads are attached when empty", () => {
        // The fixture has empty evidence_uploads, so we should see
        // the supplementary documents listed as "not yet uploaded"
        expect(sections.evidence_references).toContain("not yet uploaded");
        expect(sections.evidence_references).toContain("may be provided later");
      });

      it("lists documents that may be provided separately", () => {
        expect(sections.evidence_references).toContain("Tenancy agreement");
        expect(sections.evidence_references).toContain("Bank statements");
        expect(sections.evidence_references).toContain("Correspondence");
      });
    });

    describe("Rent Arrears Section (optional)", () => {
      it("contains non-empty rent arrears narrative", () => {
        expect(sections.rent_arrears).toBeTruthy();
        expect(sections.rent_arrears!.length).toBeGreaterThan(50);
      });

      it("mentions arrears total", () => {
        expect(sections.rent_arrears).toContain("£7,000.07");
      });

      it("mentions rental periods", () => {
        expect(sections.rent_arrears).toContain("7 complete rental periods");
      });

      it("references Schedule of Arrears", () => {
        expect(sections.rent_arrears).toContain("Schedule of Arrears");
      });
    });

    describe("Conclusion (Statement of Truth)", () => {
      it("contains statement of truth text", () => {
        expect(sections.conclusion).toBeTruthy();
        expect(sections.conclusion.length).toBeGreaterThan(50);
      });

      it("contains required legal language about truth", () => {
        expect(sections.conclusion).toContain("true");
        expect(sections.conclusion).toContain("believe");
      });

      it("mentions contempt of court", () => {
        expect(sections.conclusion).toContain("contempt of court");
      });
    });

    describe("Conduct Issues Section", () => {
      it("is undefined for Ground 8 arrears cases", () => {
        expect(sections.conduct_issues).toBeUndefined();
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles missing optional fields gracefully", () => {
      const minimalInput: WitnessStatementSectionsInput = {
        landlord: {
          full_name: "Test Landlord",
        },
        tenant: {
          full_name: "Test Tenant",
        },
        property: {
          address_line_1: "123 Test Street",
        },
        tenancy: {
          start_date: "2025-01-01",
          rent_amount: 1000,
          rent_frequency: "monthly",
        },
        notice: {
          served_date: "2026-01-01",
          service_method: "first_class_post",
          expiry_date: "2026-01-15",
        },
        section8: {
          grounds: ["ground_8"],
        },
      };

      const sections = buildWitnessStatementSections(minimalInput);

      // All sections should still be populated
      expect(sections.introduction).toBeTruthy();
      expect(sections.tenancy_history).toBeTruthy();
      expect(sections.grounds_summary).toBeTruthy();
      expect(sections.timeline).toBeTruthy();
      expect(sections.evidence_references).toBeTruthy();
      expect(sections.conclusion).toBeTruthy();
    });

    it("handles multiple grounds", () => {
      const multiGroundInput: WitnessStatementSectionsInput = {
        ...extractWitnessStatementSectionsInput(goldenFixture),
        section8: {
          grounds: ["ground_8", "ground_10", "ground_11"],
        },
      };

      const sections = buildWitnessStatementSections(multiGroundInput);

      expect(sections.grounds_summary).toContain("Ground 8");
      expect(sections.grounds_summary).toContain("Ground 10");
      expect(sections.grounds_summary).toContain("Ground 11");
      // Should have explanations for each ground
      expect(sections.grounds_summary).toContain("mandatory ground");
      expect(sections.grounds_summary).toContain("discretionary ground");
    });

    it("handles evidence uploads correctly", () => {
      const inputWithUploads: WitnessStatementSectionsInput = {
        ...extractWitnessStatementSectionsInput(goldenFixture),
        evidence_uploads: ["tenancy_agreement.pdf", "rent_ledger.xlsx"],
      };

      const sections = buildWitnessStatementSections(inputWithUploads);

      expect(sections.evidence_references).toContain("tenancy_agreement.pdf");
      expect(sections.evidence_references).toContain("rent_ledger.xlsx");
      expect(sections.evidence_references).toContain("uploaded separately");
    });

    it("handles case with no arrears items", () => {
      const noArrearsItemsInput: WitnessStatementSectionsInput = {
        ...extractWitnessStatementSectionsInput(goldenFixture),
        arrears: {
          total_arrears: 5000,
          items: [],
        },
      };

      const sections = buildWitnessStatementSections(noArrearsItemsInput);

      // Timeline should still work without earliest arrears date
      expect(sections.timeline).toBeTruthy();
      expect(sections.timeline).toContain("Tenancy commenced");
    });
  });
});

describe("Witness Statement Template Integration", () => {
  it("template has correct Claim No line format", () => {
    const templatePath = path.join(
      process.cwd(),
      "config/jurisdictions/uk/england/templates/eviction/witness-statement.hbs"
    );
    const template = fs.readFileSync(templatePath, "utf-8");

    // Should have "Claim No: " with empty value
    expect(template).toContain("Claim No: ");
    // Should NOT have placeholder text
    expect(template).not.toContain("[To be inserted by court]");
    expect(template).not.toContain("TBC");
    expect(template).not.toContain("____");
  });

  it("template has landlord name and address placeholders", () => {
    const templatePath = path.join(
      process.cwd(),
      "config/jurisdictions/uk/england/templates/eviction/witness-statement.hbs"
    );
    const template = fs.readFileSync(templatePath, "utf-8");

    // Should have placeholders for landlord info
    expect(template).toContain("{{landlord_name}}");
    expect(template).toContain("{{landlord_address}}");
  });

  it("template has witness statement section placeholders", () => {
    const templatePath = path.join(
      process.cwd(),
      "config/jurisdictions/uk/england/templates/eviction/witness-statement.hbs"
    );
    const template = fs.readFileSync(templatePath, "utf-8");

    // Should have placeholders for all sections
    expect(template).toContain("witness_statement.introduction");
    expect(template).toContain("witness_statement.tenancy_history");
    expect(template).toContain("witness_statement.grounds_summary");
    expect(template).toContain("witness_statement.timeline");
    expect(template).toContain("witness_statement.evidence_references");
    expect(template).toContain("witness_statement.conclusion");
  });

  it("template has tenant name placeholder", () => {
    const templatePath = path.join(
      process.cwd(),
      "config/jurisdictions/uk/england/templates/eviction/witness-statement.hbs"
    );
    const template = fs.readFileSync(templatePath, "utf-8");

    expect(template).toContain("{{tenant_name}}");
  });
});
