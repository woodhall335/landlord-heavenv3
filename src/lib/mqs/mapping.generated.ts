import fs from "fs";
import path from "path";
import yaml from "js-yaml";

import { getCapabilityMatrix, type Jurisdiction, type Product } from "../jurisdictions/capabilities/matrix";
import { collectSchemaKeys } from "../jurisdictions/facts/referenceScanner";

export interface FlowMapping {
  jurisdiction: Jurisdiction;
  product: Product;
  route: string;
  factKeyToQuestionIds: Record<string, string[]>;
  questionIdToFactKeys: Record<string, string[]>;
  fieldIdToFactKeys: Record<string, string[]>;
  unknownFactKeys: string[];
  missingQuestionIds: string[];
}

const productDirMap: Record<Product, string> = {
  notice_only: "notice_only",
  eviction_pack: "complete_pack",
  money_claim: "money_claim",
  tenancy_agreement: "tenancy_agreement",
};

function normalizeMapsTo(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  return [];
}

function collectFieldIds(question: any): string[] {
  const ids: string[] = [];
  if (typeof question?.id === "string") ids.push(question.id);
  if (Array.isArray(question?.fields)) {
    for (const field of question.fields) {
      if (field && typeof field === "object" && typeof field.id === "string") {
        ids.push(field.id);
      }
    }
  }
  return ids;
}

function loadFactsSchemaKeys(jurisdiction: Jurisdiction): Set<string> {
  const schemaPath = path.join(process.cwd(), "config", "jurisdictions", "uk", jurisdiction, "facts_schema.json");
  const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
  return collectSchemaKeys(schema);
}

function buildFlowMapping(jurisdiction: Jurisdiction, product: Product, route: string): FlowMapping | null {
  const schemaKeys = loadFactsSchemaKeys(jurisdiction);
  const productDir = productDirMap[product];
  const mqsPath = path.join(process.cwd(), "config", "mqs", productDir, `${jurisdiction}.yaml`);
  if (!fs.existsSync(mqsPath)) return null;

  const raw = fs.readFileSync(mqsPath, "utf8");
  const doc = yaml.load(raw) as any;
  const questions = Array.isArray(doc?.questions) ? doc.questions : [];

  const factKeyToQuestionIds: Record<string, string[]> = {};
  const questionIdToFactKeys: Record<string, string[]> = {};
  const fieldIdToFactKeys: Record<string, string[]> = {};
  const unknownFactKeys: Set<string> = new Set();
  const missingQuestionIds: Set<string> = new Set();

  const questionIds = new Set<string>();
  for (const q of questions) {
    if (q && typeof q.id === "string") questionIds.add(q.id);
  }

  for (const question of questions) {
    const factKeys = normalizeMapsTo(question?.maps_to);
    if (!factKeys.length) continue;

    const ids = collectFieldIds(question);
    for (const factKey of factKeys) {
      if (!schemaKeys.has(factKey)) {
        unknownFactKeys.add(factKey);
      }
      factKeyToQuestionIds[factKey] = Array.from(new Set([...(factKeyToQuestionIds[factKey] ?? []), ...(question.id ? [question.id] : [])]));
      if (question.id) {
        questionIdToFactKeys[question.id] = Array.from(new Set([...(questionIdToFactKeys[question.id] ?? []), factKey]));
      }
      for (const id of ids) {
        fieldIdToFactKeys[id] = Array.from(new Set([...(fieldIdToFactKeys[id] ?? []), factKey]));
      }
    }
  }

  for (const [factKey, ids] of Object.entries(factKeyToQuestionIds)) {
    for (const id of ids) {
      if (!questionIds.has(id)) {
        missingQuestionIds.add(id);
      }
    }
  }

  return {
    jurisdiction,
    product,
    route,
    factKeyToQuestionIds,
    questionIdToFactKeys,
    fieldIdToFactKeys,
    unknownFactKeys: Array.from(unknownFactKeys),
    missingQuestionIds: Array.from(missingQuestionIds),
  };
}

const flowMappings: FlowMapping[] = [];
const matrix = getCapabilityMatrix();

for (const jurisdiction of Object.keys(matrix) as Jurisdiction[]) {
  for (const product of Object.keys(matrix[jurisdiction]) as Product[]) {
    const flow = matrix[jurisdiction][product];
    if (flow.status !== "supported") continue;
    for (const route of flow.routes) {
      const mapping = buildFlowMapping(jurisdiction, product, route);
      if (mapping) {
        flowMappings.push(mapping);
      }
    }
  }
}

export function getFlowMappings(): FlowMapping[] {
  return flowMappings;
}

export function getFlowMapping(jurisdiction: Jurisdiction, product: Product, route: string): FlowMapping | undefined {
  return flowMappings.find(
    (m) => m.jurisdiction === jurisdiction && m.product === product && m.route === route,
  );
}
