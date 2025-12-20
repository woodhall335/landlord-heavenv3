import fs from "fs";
import path from "path";
import yaml from "js-yaml";

export type FactSourceType = "mqs" | "decision_rules" | "decision_engine";

export interface FactReferenceSource {
  type: FactSourceType;
  file: string;
  line?: number;
  product?: string;
  questionId?: string;
  detail?: string;
}

export interface FactReference {
  jurisdiction: string;
  key: string;
  source: FactReferenceSource;
}

const products = ["notice_only", "eviction_pack", "money_claim", "tenancy_agreement"] as const;
const productDirMap: Record<string, string> = {
  notice_only: "notice_only",
  eviction_pack: "complete_pack",
  money_claim: "money_claim",
  tenancy_agreement: "tenancy_agreement",
};

function findLineNumber(content: string, needle: string): number | undefined {
  const idx = content.indexOf(needle);
  if (idx === -1) return undefined;
  return content.slice(0, idx).split(/\r?\n/).length;
}

export function collectSchemaKeys(schema: any, accumulator = new Set<string>(), prefix = ""): Set<string> {
  if (!schema || typeof schema !== "object") return accumulator;
  for (const [key, value] of Object.entries(schema)) {
    if (!value || typeof value !== "object") continue;
    const currentPath = prefix ? `${prefix}.${key}` : key;
    if ((value as any).type) {
      accumulator.add(key);
      accumulator.add(currentPath);
    }
    collectSchemaKeys(value, accumulator, currentPath);
  }
  return accumulator;
}

export function collectFactReferences(jurisdiction: string): FactReference[] {
  const references: FactReference[] = [];

  // MQS mappings
  for (const product of products) {
    const dir = productDirMap[product];
    const filePath = path.join(process.cwd(), "config", "mqs", dir, `${jurisdiction}.yaml`);
    if (!fs.existsSync(filePath)) continue;
    const raw = fs.readFileSync(filePath, "utf8");
    const doc = yaml.load(raw) as any;
    const questions = Array.isArray(doc?.questions) ? doc.questions : [];
    for (const question of questions) {
      const mapsTo = question?.maps_to;
      if (!mapsTo) continue;
      const questionId = question?.id;
      const addRef = (key: string) => {
        references.push({
          jurisdiction,
          key,
          source: {
            type: "mqs",
            file: path.join("config", "mqs", dir, `${jurisdiction}.yaml`),
            line: findLineNumber(raw, String(key)),
            product,
            questionId,
            detail: questionId ? `maps_to from ${questionId}` : undefined,
          },
        });
      };

      if (typeof mapsTo === "string") {
        addRef(mapsTo);
      } else if (Array.isArray(mapsTo)) {
        for (const m of mapsTo) {
          if (typeof m === "string") addRef(m);
        }
      }
    }
  }

  // decision_rules required_facts
  const decisionRulesPath = path.join(process.cwd(), "config", "jurisdictions", "uk", jurisdiction, "decision_rules.yaml");
  if (fs.existsSync(decisionRulesPath)) {
    const raw = fs.readFileSync(decisionRulesPath, "utf8");
    const doc = yaml.load(raw) as any;
    const visit = (node: any) => {
      if (Array.isArray(node)) {
        node.forEach(visit);
        return;
      }
      if (!node || typeof node !== "object") return;
      if (Array.isArray((node as any).required_facts)) {
        for (const fact of node.required_facts) {
          if (typeof fact !== "string") continue;
          references.push({
            jurisdiction,
            key: fact,
            source: {
              type: "decision_rules",
              file: path.join("config", "jurisdictions", "uk", jurisdiction, "decision_rules.yaml"),
              line: findLineNumber(raw, fact),
              detail: "required_facts",
            },
          });
        }
      }
      Object.values(node).forEach(visit);
    };
    visit(doc);
  }

  // decision_engine rules
  const decisionEnginePath = path.join(
    process.cwd(),
    "config",
    "jurisdictions",
    "uk",
    jurisdiction,
    "rules",
    "decision_engine.yaml",
  );
  if (fs.existsSync(decisionEnginePath)) {
    const raw = fs.readFileSync(decisionEnginePath, "utf8");
    const doc = yaml.load(raw) as any;
    const rules = Array.isArray(doc?.rules) ? doc.rules : [];
    for (const rule of rules) {
      if (rule && typeof rule === "object" && rule.conditions && typeof rule.conditions === "object") {
        for (const conditionKey of Object.keys(rule.conditions)) {
          references.push({
            jurisdiction,
            key: conditionKey,
            source: {
              type: "decision_engine",
              file: path.join("config", "jurisdictions", "uk", jurisdiction, "rules", "decision_engine.yaml"),
              line: findLineNumber(raw, conditionKey),
              detail: "condition",
            },
          });
        }
      }
    }
  }

  return references;
}

export interface MissingFact {
  jurisdiction: string;
  key: string;
  references: FactReference[];
}

export function findMissingFacts(jurisdiction: string): MissingFact[] {
  const schemaPath = path.join(process.cwd(), "config", "jurisdictions", "uk", jurisdiction, "facts_schema.json");
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Missing facts_schema for ${jurisdiction}`);
  }
  const schemaKeys = collectSchemaKeys(JSON.parse(fs.readFileSync(schemaPath, "utf8")));
  const references = collectFactReferences(jurisdiction);

  const missingMap = new Map<string, MissingFact>();
  for (const ref of references) {
    if (schemaKeys.has(ref.key)) continue;
    if (!missingMap.has(ref.key)) {
      missingMap.set(ref.key, { jurisdiction, key: ref.key, references: [] });
    }
    missingMap.get(ref.key)?.references.push(ref);
  }

  return Array.from(missingMap.values());
}
