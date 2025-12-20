import fs from "fs";
import path from "path";
import yaml from "js-yaml";

import { getTemplatesForFlow } from "./templateRegistry";

export type Jurisdiction = "england" | "wales" | "scotland" | "northern-ireland";
export type Product = "notice_only" | "eviction_pack" | "money_claim" | "tenancy_agreement";

export interface FlowCapability {
  jurisdiction: Jurisdiction;
  product: Product;
  routes: string[];
  templates: string[];
  derivedFrom: {
    mqsFile?: string;
    templatePaths: string[];
    notes?: string[];
  };
}

export type CapabilityMatrix = Record<Jurisdiction, Record<Product, FlowCapability | null>>;

const MQS_DIR = path.join(process.cwd(), "config", "mqs");

const productSlugMap: Record<string, Product> = {
  complete_pack: "eviction_pack",
  money_claim: "money_claim",
  notice_only: "notice_only",
  tenancy_agreement: "tenancy_agreement",
};

function isDeprecated(file: string) {
  return file.toLowerCase().includes("deprecated");
}

function parseJurisdiction(doc: any): Jurisdiction {
  const explicit = doc?.jurisdiction || doc?.__meta?.jurisdiction;
  if (!explicit || typeof explicit !== "string") {
    throw new Error("Missing jurisdiction in MQS YAML");
  }
  return String(explicit) as Jurisdiction;
}

function parseRoutes(product: Product, jurisdiction: Jurisdiction, doc: any): string[] {
  if (!doc || typeof doc !== "object") return [];
  const questions = Array.isArray(doc.questions) ? doc.questions : [];
  if (product === "notice_only" || product === "eviction_pack") {
    const routeQuestion = questions.find(
      (q: any) => q?.id === "selected_notice_route" || q?.maps_to?.includes?.("selected_notice_route"),
    );
    if (routeQuestion) {
      const options = Array.isArray(routeQuestion.options) ? routeQuestion.options : [];
      const values = options
        .map((opt) => {
          if (typeof opt === "string") return opt.trim();
          if (opt && typeof opt === "object" && opt.value) return String(opt.value).trim();
          return null;
        })
        .filter((v): v is string => !!v);
      if (values.length) return Array.from(new Set(values));
    }

    if (jurisdiction === "scotland") return ["notice_to_leave"];
    if (jurisdiction === "wales") return ["wales_section_173"];
  }

  return [product];
}

function buildCapabilityMatrix(): CapabilityMatrix {
  const matrix: CapabilityMatrix = {
    england: { notice_only: null, eviction_pack: null, money_claim: null, tenancy_agreement: null },
    wales: { notice_only: null, eviction_pack: null, money_claim: null, tenancy_agreement: null },
    scotland: { notice_only: null, eviction_pack: null, money_claim: null, tenancy_agreement: null },
    "northern-ireland": { notice_only: null, eviction_pack: null, money_claim: null, tenancy_agreement: null },
  };

  for (const productDir of fs.readdirSync(MQS_DIR)) {
    const product = productSlugMap[productDir];
    if (!product) continue;
    const fullProductDir = path.join(MQS_DIR, productDir);
    const files = fs.readdirSync(fullProductDir).filter((file) => file.endsWith(".yaml") && !isDeprecated(file));
    for (const file of files) {
      const jurisdictionFromFile = file.replace(/\.yaml$/, "") as Jurisdiction;
      const raw = fs.readFileSync(path.join(fullProductDir, file), "utf8");
      const doc = yaml.load(raw);
      const jurisdictionFromDoc = parseJurisdiction(doc);

      if (jurisdictionFromDoc !== jurisdictionFromFile) {
        throw new Error(
          `Jurisdiction mismatch for ${file}: file implies ${jurisdictionFromFile} but YAML declares ${jurisdictionFromDoc}`,
        );
      }

      if (!matrix[jurisdictionFromDoc]) continue;

      const routes = parseRoutes(product, jurisdictionFromDoc, doc);
      const templates = getTemplatesForFlow({ jurisdiction: jurisdictionFromDoc, product, routes });
      if (templates.length === 0) {
        matrix[jurisdictionFromDoc][product] = null;
        continue;
      }
      const capability: FlowCapability = {
        jurisdiction: jurisdictionFromDoc,
        product,
        routes: routes.length ? routes : [product],
        templates,
        derivedFrom: {
          mqsFile: path.join("config", "mqs", productDir, file),
          templatePaths: templates,
          notes: [],
        },
      };
      matrix[jurisdictionFromDoc][product] = capability;
    }
  }

  // Enforce NI rule: tenancy_agreement only.
  for (const product of ["notice_only", "eviction_pack", "money_claim"] as Product[]) {
    matrix["northern-ireland"][product] = null;
  }

  return matrix;
}

const capabilityMatrix = buildCapabilityMatrix();

export function getCapabilityMatrix(): CapabilityMatrix {
  return capabilityMatrix;
}

export function isFlowSupported(jurisdiction: Jurisdiction, product: Product, route?: string): boolean {
  const capability = capabilityMatrix[jurisdiction]?.[product];
  if (!capability) return false;
  if (!route) return true;
  return capability.routes.includes(route);
}

export function getSupportedRoutes(jurisdiction: Jurisdiction, product: Product): string[] {
  const capability = capabilityMatrix[jurisdiction]?.[product];
  return capability?.routes ?? [];
}

