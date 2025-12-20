import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { describe, expect, it } from "vitest";

const jurisdictions = ["england", "wales", "scotland", "northern-ireland"] as const;
const products = ["notice_only", "eviction_pack", "money_claim", "tenancy_agreement"] as const;

function collectSchemaKeys(schema: any, set = new Set<string>(), prefix = ""): Set<string> {
  if (!schema || typeof schema !== "object") return set;
  for (const [key, value] of Object.entries(schema)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const currentPath = prefix ? `${prefix}.${key}` : key;
      if ((value as any).type) {
        set.add(key);
        set.add(currentPath);
      }
      collectSchemaKeys(value, set, currentPath);
    }
  }
  return set;
}

function collectMapsToKeys(jurisdiction: string): Set<string> {
  const keys = new Set<string>();
  for (const product of products) {
    const filePath = path.join(process.cwd(), "config", "mqs", product === "eviction_pack" ? "complete_pack" : product, `${jurisdiction}.yaml`);
    if (!fs.existsSync(filePath)) continue;
    const doc = yaml.load(fs.readFileSync(filePath, "utf8")) as any;
    const questions = Array.isArray((doc as any)?.questions) ? (doc as any).questions : [];
    for (const question of questions) {
      const mapsTo = (question as any)?.maps_to;
      if (!mapsTo) continue;
      if (typeof mapsTo === "string") {
        keys.add(mapsTo);
      } else if (Array.isArray(mapsTo)) {
        for (const m of mapsTo) {
          if (typeof m === "string") keys.add(m);
        }
      }
    }
  }
  return keys;
}

function collectDecisionRuleKeys(jurisdiction: string): Set<string> {
  const keys = new Set<string>();
  const filePath = path.join(process.cwd(), "config", "jurisdictions", "uk", jurisdiction, "decision_rules.yaml");
  if (!fs.existsSync(filePath)) return keys;
  const doc = yaml.load(fs.readFileSync(filePath, "utf8")) as any;

  const visit = (node: any) => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (!node || typeof node !== "object") return;

    if (node.required_facts && Array.isArray(node.required_facts)) {
      for (const fact of node.required_facts) {
        if (typeof fact === "string") keys.add(fact);
      }
    }
    if (node.eligibility_rules && Array.isArray(node.eligibility_rules)) {
      for (const rule of node.eligibility_rules) {
        if (typeof rule === "string") {
          const matches = rule.match(/[a-zA-Z_][a-zA-Z0-9_]*/g) || [];
          matches.forEach((m) => keys.add(m));
        }
      }
    }

    Object.values(node).forEach(visit);
  };

  visit(doc);
  return keys;
}

function collectDecisionEngineKeys(jurisdiction: string): Set<string> {
  const keys = new Set<string>();
  const filePath = path.join(process.cwd(), "config", "jurisdictions", "uk", jurisdiction, "rules", "decision_engine.yaml");
  if (!fs.existsSync(filePath)) return keys;
  const doc = yaml.load(fs.readFileSync(filePath, "utf8")) as any;
  const rules = Array.isArray(doc?.rules) ? doc.rules : [];
  for (const rule of rules) {
    if (rule && typeof rule === "object" && rule.conditions && typeof rule.conditions === "object") {
      for (const conditionKey of Object.keys(rule.conditions)) {
        keys.add(conditionKey);
      }
    }
  }
  return keys;
}

describe("facts_schema completeness", () => {
  it("covers all MQS and decision-engine referenced facts", () => {
    for (const jurisdiction of jurisdictions) {
      const schemaPath = path.join(process.cwd(), "config", "jurisdictions", "uk", jurisdiction, "facts_schema.json");
      expect(fs.existsSync(schemaPath), `Missing facts_schema for ${jurisdiction}`).toBe(true);
      const schemaKeys = collectSchemaKeys(JSON.parse(fs.readFileSync(schemaPath, "utf8")));

      const referenced = new Set<string>([...collectMapsToKeys(jurisdiction), ...collectDecisionRuleKeys(jurisdiction), ...collectDecisionEngineKeys(jurisdiction)]);
      const missing: string[] = [];
      for (const key of referenced) {
        if (!schemaKeys.has(key)) {
          missing.push(key);
        }
      }

      expect(missing, `Missing schema keys for ${jurisdiction}: ${missing.join(", ")}`).toHaveLength(0);
    }
  });
});
