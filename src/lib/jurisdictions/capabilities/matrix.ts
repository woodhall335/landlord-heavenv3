import fs from "fs";
import path from "path";
import yaml from "js-yaml";

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
const TEMPLATES_DIR = path.join(process.cwd(), "config", "jurisdictions", "uk");

const productSlugMap: Record<string, Product> = {
  complete_pack: "eviction_pack",
  money_claim: "money_claim",
  notice_only: "notice_only",
  tenancy_agreement: "tenancy_agreement",
};

function isDeprecated(file: string) {
  return file.toLowerCase().includes("deprecated");
}

function parseRoutes(doc: any): string[] {
  if (!doc || typeof doc !== "object") return ["default"];
  const questions = Array.isArray(doc.questions) ? doc.questions : [];
  for (const question of questions) {
    if (!question || typeof question !== "object") continue;
    const targetIds = [question.id, ...(question.maps_to ?? [])].filter(Boolean);
    const routeKeywords = ["route", "selected_notice_route", "possession_route", "eviction_route"];
    if (targetIds.some((id: string) => routeKeywords.some((keyword) => String(id).includes(keyword)))) {
      const opts = (question.options || []) as any[];
      const values: string[] = [];
      for (const opt of opts) {
        if (typeof opt === "string") {
          values.push(opt);
        } else if (opt && typeof opt === "object" && opt.value) {
          values.push(String(opt.value));
        }
      }
      if (values.length) return values.map((v) => v.trim()).filter(Boolean);
    }
  }
  return ["default"];
}

function getTemplateCandidates(jurisdiction: Jurisdiction, product: Product): string[] {
  const jurisdictionTemplateDir = path.join(TEMPLATES_DIR, jurisdiction, "templates");
  if (!fs.existsSync(jurisdictionTemplateDir)) return [];
  const entries = fs.readdirSync(jurisdictionTemplateDir);
  const productHints: Record<Product, string[]> = {
    notice_only: ["notice", "form6a", "notice_only", "section"],
    eviction_pack: ["pack", "possession", "eviction"],
    money_claim: ["money_claim", "n5", "n119", "letter_before_action"],
    tenancy_agreement: ["ast", "tenancy", "agreement"],
  };
  const hints = productHints[product];
  return entries
    .filter((name) => hints.some((hint) => name.toLowerCase().includes(hint)))
    .map((name) => path.join("config", "jurisdictions", "uk", jurisdiction, "templates", name));
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
      const jurisdiction = file.replace(/\.yaml$/, "") as Jurisdiction;
      if (!matrix[jurisdiction]) continue;
      const raw = fs.readFileSync(path.join(fullProductDir, file), "utf8");
      const doc = yaml.load(raw);
      const routes = parseRoutes(doc);
      const templates = getTemplateCandidates(jurisdiction, product);
      const capability: FlowCapability = {
        jurisdiction,
        product,
        routes,
        templates,
        derivedFrom: {
          mqsFile: path.join("config", "mqs", productDir, file),
          templatePaths: templates,
          notes: [],
        },
      };
      matrix[jurisdiction][product] = capability;
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

