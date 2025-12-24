import fs from "fs";
import path from "path";
import yaml from "js-yaml";

import { resolveTemplatesForFlow } from "./templateRegistry";

export type Jurisdiction = "england" | "wales" | "scotland" | "northern-ireland";
export type Product = "notice_only" | "eviction_pack" | "money_claim" | "tenancy_agreement";

export type FlowStatus = "supported" | "unsupported" | "misconfigured";

export interface FlowCapability {
  jurisdiction: Jurisdiction;
  product: Product;
  status: FlowStatus;
  routes: string[];
  templates: string[];
  derivedFrom: {
    mqsFile?: string;
    templatePaths: string[];
    notes?: string[];
  };
}

export interface CapabilityBuildReportItem {
  jurisdiction: Jurisdiction;
  product: Product;
  routes: string[];
  reason: string;
  mqsFile?: string;
}

export interface CapabilityBuildReport {
  misconfigured: CapabilityBuildReportItem[];
  templateRegistryGaps: CapabilityBuildReportItem[];
  routeQuestionIssues: CapabilityBuildReportItem[];
}

export type CapabilityMatrix = Record<Jurisdiction, Record<Product, FlowCapability>>;

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

function parseRoutes(
  product: Product,
  jurisdiction: Jurisdiction,
  doc: any,
  issues: CapabilityBuildReportItem[],
  mqsFile?: string,
): string[] {
  if (!doc || typeof doc !== "object") return [];
  const questions = Array.isArray(doc.questions) ? doc.questions : [];
  if (product === "notice_only" || product === "eviction_pack") {
    const routeQuestion = questions.find(
      (q: any) => q?.id === "selected_notice_route" || q?.maps_to?.includes?.("selected_notice_route"),
    );
    if (routeQuestion) {
    const options: Array<string | { value?: unknown }> = Array.isArray(routeQuestion.options)
      ? routeQuestion.options
      : [];
    const values = options
      .map((opt) => {
        if (typeof opt === "string") return opt.trim();
        if (opt && typeof opt === "object" && "value" in opt && opt.value) return String(opt.value).trim();
        return null;
      })
      .filter((v): v is string => !!v);
    if (values.length) return Array.from(new Set(values));
    }

    issues.push({
      jurisdiction,
      product,
      routes: [],
      reason: "Missing selected_notice_route options; defaulted route",
      mqsFile,
    });

    if (jurisdiction === "scotland") return ["notice_to_leave"];
    if (jurisdiction === "wales") return ["wales_section_173"];
  }

  return [product];
}

function buildCapabilityMatrix(): { matrix: CapabilityMatrix; report: CapabilityBuildReport } {
  const report: CapabilityBuildReport = { misconfigured: [], templateRegistryGaps: [], routeQuestionIssues: [] };
  const matrix: CapabilityMatrix = {
    england: {
      notice_only: {
        jurisdiction: "england",
        product: "notice_only",
        status: "unsupported",
        routes: [],
        templates: [],
        derivedFrom: { templatePaths: [], notes: ["MQS file not found"] },
      },
      eviction_pack: {
        jurisdiction: "england",
        product: "eviction_pack",
        status: "unsupported",
        routes: [],
        templates: [],
        derivedFrom: { templatePaths: [], notes: ["MQS file not found"] },
      },
      money_claim: {
        jurisdiction: "england",
        product: "money_claim",
        status: "unsupported",
        routes: [],
        templates: [],
        derivedFrom: { templatePaths: [], notes: ["MQS file not found"] },
      },
      tenancy_agreement: {
        jurisdiction: "england",
        product: "tenancy_agreement",
        status: "unsupported",
        routes: [],
        templates: [],
        derivedFrom: { templatePaths: [], notes: ["MQS file not found"] },
      },
    },
    wales: {
      notice_only: {
        jurisdiction: "wales",
        product: "notice_only",
        status: "unsupported",
        routes: [],
        templates: [],
        derivedFrom: { templatePaths: [], notes: ["MQS file not found"] },
      },
      eviction_pack: {
        jurisdiction: "wales",
        product: "eviction_pack",
        status: "unsupported",
        routes: [],
        templates: [],
        derivedFrom: { templatePaths: [], notes: ["MQS file not found"] },
      },
      money_claim: {
        jurisdiction: "wales",
        product: "money_claim",
        status: "unsupported",
        routes: [],
        templates: [],
        derivedFrom: { templatePaths: [], notes: ["MQS file not found"] },
      },
      tenancy_agreement: {
        jurisdiction: "wales",
        product: "tenancy_agreement",
        status: "unsupported",
        routes: [],
        templates: [],
        derivedFrom: { templatePaths: [], notes: ["MQS file not found"] },
      },
    },
    scotland: {
      notice_only: {
        jurisdiction: "scotland",
        product: "notice_only",
        status: "unsupported",
        routes: [],
        templates: [],
        derivedFrom: { templatePaths: [], notes: ["MQS file not found"] },
      },
      eviction_pack: {
        jurisdiction: "scotland",
        product: "eviction_pack",
        status: "unsupported",
        routes: [],
        templates: [],
        derivedFrom: { templatePaths: [], notes: ["MQS file not found"] },
      },
      money_claim: {
        jurisdiction: "scotland",
        product: "money_claim",
        status: "unsupported",
        routes: [],
        templates: [],
        derivedFrom: { templatePaths: [], notes: ["MQS file not found"] },
      },
      tenancy_agreement: {
        jurisdiction: "scotland",
        product: "tenancy_agreement",
        status: "unsupported",
        routes: [],
        templates: [],
        derivedFrom: { templatePaths: [], notes: ["MQS file not found"] },
      },
    },
    "northern-ireland": {
      notice_only: {
        jurisdiction: "northern-ireland",
        product: "notice_only",
        status: "unsupported",
        routes: [],
        templates: [],
        derivedFrom: { templatePaths: [], notes: ["MQS file not found"] },
      },
      eviction_pack: {
        jurisdiction: "northern-ireland",
        product: "eviction_pack",
        status: "unsupported",
        routes: [],
        templates: [],
        derivedFrom: { templatePaths: [], notes: ["MQS file not found"] },
      },
      money_claim: {
        jurisdiction: "northern-ireland",
        product: "money_claim",
        status: "unsupported",
        routes: [],
        templates: [],
        derivedFrom: { templatePaths: [], notes: ["MQS file not found"] },
      },
      tenancy_agreement: {
        jurisdiction: "northern-ireland",
        product: "tenancy_agreement",
        status: "unsupported",
        routes: [],
        templates: [],
        derivedFrom: { templatePaths: [], notes: ["MQS file not found"] },
      },
    },
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

      const routes = parseRoutes(product, jurisdictionFromDoc, doc, report.routeQuestionIssues, path.join("config", "mqs", productDir, file));
      const templateResolution = resolveTemplatesForFlow({ jurisdiction: jurisdictionFromDoc, product, routes });
      const notes: string[] = [];
      let status: FlowStatus = "supported";

      if (!templateResolution.registryFound) {
        status = "misconfigured";
        const reason = "Template registry missing for flow";
        report.misconfigured.push({
          jurisdiction: jurisdictionFromDoc,
          product,
          routes,
          reason,
          mqsFile: path.join("config", "mqs", productDir, file),
        });
        report.templateRegistryGaps.push({
          jurisdiction: jurisdictionFromDoc,
          product,
          routes,
          reason,
          mqsFile: path.join("config", "mqs", productDir, file),
        });
        notes.push(reason);
      }

      if (templateResolution.missingOnDisk.length > 0) {
        status = "misconfigured";
        const reason = `Templates missing on disk: ${templateResolution.missingOnDisk.join(", ")}`;
        report.misconfigured.push({
          jurisdiction: jurisdictionFromDoc,
          product,
          routes,
          reason,
          mqsFile: path.join("config", "mqs", productDir, file),
        });
        notes.push(reason);
      }

      if (status !== "misconfigured" && templateResolution.templates.length === 0) {
        status = "misconfigured";
        const reason = "No templates resolved for flow";
        report.misconfigured.push({
          jurisdiction: jurisdictionFromDoc,
          product,
          routes,
          reason,
          mqsFile: path.join("config", "mqs", productDir, file),
        });
        notes.push(reason);
      }

      const capability: FlowCapability = {
        jurisdiction: jurisdictionFromDoc,
        product,
        status,
        routes: routes.length ? routes : [product],
        templates: templateResolution.templates,
        derivedFrom: {
          mqsFile: path.join("config", "mqs", productDir, file),
          templatePaths: templateResolution.templates,
          notes,
        },
      };
      matrix[jurisdictionFromDoc][product] = capability;
    }
  }

  // Enforce NI rule: tenancy_agreement only.
  for (const product of ["notice_only", "eviction_pack", "money_claim"] as Product[]) {
    matrix["northern-ireland"][product] = {
      jurisdiction: "northern-ireland",
      product,
      status: "unsupported",
      routes: matrix["northern-ireland"][product].routes.length ? matrix["northern-ireland"][product].routes : [product],
      templates: [],
      derivedFrom: {
        ...matrix["northern-ireland"][product].derivedFrom,
        notes: ["Northern Ireland is tenancy agreements only"],
      },
    };
  }

  return { matrix, report };
}

const { matrix: capabilityMatrix, report: capabilityReport } = buildCapabilityMatrix();

export function getCapabilityMatrix(): CapabilityMatrix {
  return capabilityMatrix;
}

export function getCapabilityBuildReport(): CapabilityBuildReport {
  return capabilityReport;
}

export function isFlowSupported(jurisdiction: Jurisdiction, product: Product, route?: string): boolean {
  const capability = capabilityMatrix[jurisdiction]?.[product];
  if (!capability || capability.status !== "supported") return false;
  if (!route) return true;
  return capability.routes.includes(route);
}

export function getSupportedRoutes(jurisdiction: Jurisdiction, product: Product): string[] {
  const capability = capabilityMatrix[jurisdiction]?.[product];
  if (!capability || capability.status !== "supported") return [];
  return capability.routes ?? [];
}

export class FlowCapabilityError extends Error {
  statusCode = 422;
  payload: {
    code: string;
    error: string;
    user_message: string;
    blocking_issues: Array<{ code: string; fields: string[]; affected_question_id?: string; user_fix_hint?: string }>;
    warnings: any[];
  };

  constructor(code: string, userMessage: string, fields?: string[]) {
    super(userMessage);
    this.name = "FlowCapabilityError";
    this.payload = {
      code,
      error: code,
      user_message: userMessage,
      blocking_issues: [
        {
          code,
          fields: fields ?? [], // Ensure fields is always an array
          affected_question_id: undefined,
          user_fix_hint: userMessage,
        },
      ],
      warnings: [],
    };
  }
}

export function assertFlowSupported(jurisdiction: Jurisdiction, product: Product, route?: string): FlowCapability {
  const capability = capabilityMatrix[jurisdiction]?.[product];
  if (!capability) {
    throw new FlowCapabilityError("FLOW_NOT_DEFINED", `Flow ${jurisdiction}/${product} is not defined in matrix`);
  }

  if (capability.status === "misconfigured") {
    throw new FlowCapabilityError(
      "FLOW_MISCONFIGURED",
      `Flow ${jurisdiction}/${product} is misconfigured and unavailable`,
      capability.routes,
    );
  }

  if (capability.status === "unsupported") {
    throw new FlowCapabilityError(
      "FLOW_NOT_SUPPORTED",
      `Flow ${jurisdiction}/${product} is not supported`,
      capability.routes,
    );
  }

  if (route && !capability.routes.includes(route)) {
    throw new FlowCapabilityError(
      "ROUTE_NOT_SUPPORTED",
      `Route ${route} is not available for ${jurisdiction}/${product}`,
      capability.routes,
    );
  }

  return capability;
}

