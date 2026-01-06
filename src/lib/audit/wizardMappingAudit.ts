import fs from "fs";
import path from "path";
import yaml from "js-yaml";

import {
  getCapabilityMatrix,
  normalizeProductSlug,
  type Jurisdiction,
  type Product,
} from "../jurisdictions/capabilities/matrix.ts";
import { resolveTemplatesForFlow } from "../jurisdictions/capabilities/templateRegistry.ts";
import { getFlowMapping } from "../mqs/mapping.generated.ts";

export interface FlowDiscovery {
  jurisdiction: Jurisdiction;
  product: Product;
  routes: string[];
  mqsFile: string;
  routeQuestionId?: string;
  questionIds: string[];
  factKeys: string[];
  dependsOn: Array<{ id: string; dependsOn: unknown }>; // Used for quick legal logic scans
}

export interface TemplateCoverage {
  jurisdiction: Jurisdiction;
  product: Product;
  route: string;
  templates: string[];
  missingOnDisk: string[];
  registryFound: boolean;
}

export interface PdfCoverage {
  referenced: Set<string>;
  existing: Set<string>;
  missing: Set<string>;
  orphaned: Set<string>;
}

export interface OfficialFormRegistryEntry {
  jurisdiction: Jurisdiction;
  product: Product;
  route: string;
  officialFormKey: string;
  pdfPath: string;
  notes?: string;
  version?: string;
  effectiveDate?: string;
}

export interface OfficialFormCoverage {
  referenced: Set<string>;
  existing: Set<string>;
  missing: Set<string>;
  orphaned: Set<string>;
  flowsMissingRegistry: string[];
  entriesByFlow: Map<string, OfficialFormRegistryEntry[]>;
}

export interface MatrixRow {
  jurisdiction: Jurisdiction;
  product: Product;
  route: string;
  mqsFile: string;
  routeQuestion?: string;
  questionIds: string[];
  factKeys: string[];
  templatePaths: string[];
  hbsPaths: string[];
  templatePdfPaths: string[];
  officialFormKeys: string[];
  officialPdfPaths: string[];
  notes: string[];
}

const MQS_DIR = path.join(process.cwd(), "config", "mqs");
const productSlugMap: Record<string, Product> = {
  complete_pack: "eviction_pack",
  money_claim: "money_claim",
  notice_only: "notice_only",
  tenancy_agreement: "tenancy_agreement",
};
const ORPHAN_WHITELIST_PATH = path.join(process.cwd(), "audit", "orphan-whitelist.json");
const OFFICIAL_FORMS_REGISTRY_PATH = path.join(process.cwd(), "config", "officialFormsRegistry.json");

function loadWhitelist(): { templates: Set<string>; pdfs: Set<string> } {
  if (!fs.existsSync(ORPHAN_WHITELIST_PATH)) return { templates: new Set(), pdfs: new Set() };
  const parsed = JSON.parse(fs.readFileSync(ORPHAN_WHITELIST_PATH, "utf8"));
  return {
    templates: new Set<string>(
      (Array.isArray(parsed?.templates) ? parsed.templates : []).map((entry: string) => path.normalize(entry)),
    ),
    pdfs: new Set<string>((Array.isArray(parsed?.pdfs) ? parsed.pdfs : []).map((entry: string) => path.normalize(entry))),
  };
}

function listYamlFiles(dir: string): string[] {
  return fs.readdirSync(dir).filter((file) => file.endsWith(".yaml") && !file.toLowerCase().includes("deprecated"));
}

function normalizeMapsTo(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  return [];
}

function parseRoutes(product: Product, jurisdiction: Jurisdiction, questions: any[]): string[] {
  if (product === "notice_only" || product === "eviction_pack") {
    const routeQuestion = questions.find(
      (q: any) => q?.id === "selected_notice_route" || normalizeMapsTo(q?.maps_to).includes("selected_notice_route"),
    );
    const options: Array<string | { value?: unknown }> = Array.isArray(routeQuestion?.options)
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

    if (jurisdiction === "scotland") return ["notice_to_leave"];
    if (jurisdiction === "wales") return ["wales_section_173"];
  }

  return [product];
}

export function discoverFlows(): FlowDiscovery[] {
  const flows: FlowDiscovery[] = [];

  for (const productDir of fs.readdirSync(MQS_DIR)) {
    const product = productSlugMap[productDir];
    if (!product) continue;
    const files = listYamlFiles(path.join(MQS_DIR, productDir));

    for (const file of files) {
      const jurisdictionFromFile = file.replace(/\.yaml$/, "") as Jurisdiction;
      const mqsPath = path.join(MQS_DIR, productDir, file);
      const raw = fs.readFileSync(mqsPath, "utf8");
      const doc = yaml.load(raw) as any;
      const jurisdictionFromDoc = (doc?.jurisdiction || doc?.__meta?.jurisdiction) as Jurisdiction;

      if (jurisdictionFromDoc !== jurisdictionFromFile) {
        throw new Error(
          `Jurisdiction mismatch for ${mqsPath}: file implies ${jurisdictionFromFile} but YAML declares ${jurisdictionFromDoc}`,
        );
      }

      const questions = Array.isArray(doc?.questions) ? doc.questions : [];
      const routeQuestion = questions.find(
        (q: any) => q?.id === "selected_notice_route" || normalizeMapsTo(q?.maps_to).includes("selected_notice_route"),
      );
      const questionIds = questions.map((q: any) => q?.id).filter((id: unknown): id is string => typeof id === "string");
      const factKeys = questions.flatMap((q: any) => normalizeMapsTo(q?.maps_to)).filter(Boolean);
      const dependsOn = questions
        .filter((q: any) => q?.depends_on)
        .map((q: any) => ({ id: q?.id, dependsOn: q.depends_on }))
        .filter((item: any) => typeof item.id === "string");

      flows.push({
        jurisdiction: jurisdictionFromDoc,
        product,
        routes: parseRoutes(product, jurisdictionFromDoc, questions),
        mqsFile: path.relative(process.cwd(), mqsPath),
        routeQuestionId: routeQuestion?.id,
        questionIds,
        factKeys: Array.from(new Set(factKeys)),
        dependsOn,
      });
    }
  }

  return flows.sort((a, b) => `${a.jurisdiction}-${a.product}`.localeCompare(`${b.jurisdiction}-${b.product}`));
}

export function collectTemplateCoverage(): { coverage: TemplateCoverage[]; referencedTemplates: Set<string> } {
  const coverage: TemplateCoverage[] = [];
  const referencedTemplates: Set<string> = new Set();
  const matrix = getCapabilityMatrix();

  for (const jurisdiction of Object.keys(matrix) as Jurisdiction[]) {
    for (const productKey of Object.keys(matrix[jurisdiction]) as Product[]) {
      const flow = matrix[jurisdiction][productKey];
      if (flow.status !== "supported") continue;

      for (const route of flow.routes) {
        const resolved = resolveTemplatesForFlow({ jurisdiction, product: productKey, routes: [route] });
        resolved.templates.forEach((tpl) => referencedTemplates.add(path.normalize(tpl)));
        coverage.push({
          jurisdiction,
          product: productKey,
          route,
          templates: resolved.templates,
          missingOnDisk: resolved.missingOnDisk,
          registryFound: resolved.registryFound,
        });
      }
    }
  }

  return { coverage, referencedTemplates };
}

export function extractPdfReferences(templatePath: string): string[] {
  const content = fs.readFileSync(templatePath, "utf8");
  const matches = content.match(/[\w\/_-]+\.pdf/gi) || [];
  return Array.from(new Set(matches.map((m) => path.normalize(m))));
}

export function collectPdfCoverage(templatePaths: Iterable<string>, additionalReferenced: Iterable<string> = []): PdfCoverage {
  const referenced = new Set<string>();
  const existing = new Set<string>();
  const whitelist = loadWhitelist();

  for (const templatePath of templatePaths) {
    const fullPath = path.join(process.cwd(), "config", "jurisdictions", templatePath);
    if (fs.existsSync(fullPath)) {
      extractPdfReferences(fullPath).forEach((ref) => referenced.add(ref));
    }
  }

  for (const ref of additionalReferenced) {
    referenced.add(path.normalize(ref));
  }

  const pdfFiles = findAllPdfFiles();
  pdfFiles.forEach((p) => existing.add(path.normalize(p)));

  const missing = new Set<string>();
  referenced.forEach((ref) => {
    const normalized = normalizePdfPath(ref);
    if (whitelist.pdfs.has(normalized)) return;
    if (!pdfFiles.has(normalized)) {
      missing.add(normalized);
    }
  });

  const orphaned = new Set<string>();
  existing.forEach((pdf) => {
    if (whitelist.pdfs.has(pdf)) return;
    if (![...referenced].some((ref) => path.normalize(ref).includes(path.basename(pdf)))) {
      orphaned.add(pdf);
    }
  });

  return { referenced, existing, missing, orphaned };
}

export function findAllPdfFiles(): Set<string> {
  const results = new Set<string>();
  const roots = [path.join(process.cwd(), "config", "jurisdictions"), path.join(process.cwd(), "public", "official-forms")];

  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".pdf")) {
        results.add(path.normalize(path.relative(process.cwd(), fullPath)));
      }
    }
  }

  for (const root of roots) {
    if (fs.existsSync(root)) {
      walk(root);
    }
  }

  return results;
}

function listTemplateFiles(): string[] {
  const root = path.join(process.cwd(), "config", "jurisdictions");
  const templates: string[] = [];

  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".hbs")) {
        templates.push(fullPath);
      }
    }
  }

  if (fs.existsSync(root)) {
    walk(root);
  }

  return templates;
}

export function findOrphanTemplates(referencedTemplates: Set<string>): string[] {
  const whitelist = loadWhitelist();
  const referencedNormalized = new Set(Array.from(referencedTemplates).map((tpl) => path.normalize(path.join("config", "jurisdictions", tpl))));
  const allTemplates = listTemplateFiles();

  return allTemplates
    .filter((tpl) => !tpl.includes(`${path.sep}_shared${path.sep}`))
    .filter((tpl) => {
      const normalized = path.normalize(tpl);
      const relative = path.normalize(path.relative(process.cwd(), tpl));
      return !referencedNormalized.has(normalized) && !whitelist.templates.has(relative);
    })
    .map((tpl) => path.relative(process.cwd(), tpl))
    .sort();
}

export function loadOfficialFormsRegistry(): OfficialFormRegistryEntry[] {
  if (!fs.existsSync(OFFICIAL_FORMS_REGISTRY_PATH)) return [];
  const parsed = JSON.parse(fs.readFileSync(OFFICIAL_FORMS_REGISTRY_PATH, "utf8"));
  const entries = Array.isArray(parsed?.entries) ? parsed.entries : [];
  return entries
    .filter(
      (entry): entry is OfficialFormRegistryEntry =>
        Boolean(entry?.jurisdiction && entry?.product && entry?.route && entry?.officialFormKey && entry?.pdfPath),
    )
    .map((entry) => ({
      ...entry,
      jurisdiction: entry.jurisdiction as Jurisdiction,
      product: entry.product as Product,
      route: String(entry.route),
      officialFormKey: String(entry.officialFormKey),
      pdfPath: normalizePdfPath(entry.pdfPath),
    }));
}

export function normalizePdfPath(pdfPath: string): string {
  const normalized = path.normalize(pdfPath);
  if (normalized.startsWith("config") || normalized.startsWith("public")) return normalized;
  return path.join("public", "official-forms", normalized);
}

function buildOfficialFormIndex(entries: OfficialFormRegistryEntry[]): Map<string, OfficialFormRegistryEntry[]> {
  const index = new Map<string, OfficialFormRegistryEntry[]>();
  for (const entry of entries) {
    const key = `${entry.jurisdiction}/${entry.product}/${entry.route}`;
    if (!index.has(key)) index.set(key, []);
    index.get(key)!.push(entry);
  }
  return index;
}

export function buildMatrixRows(
  flows: FlowDiscovery[],
  officialForms: OfficialFormRegistryEntry[] = loadOfficialFormsRegistry(),
): MatrixRow[] {
  const officialIndex = buildOfficialFormIndex(officialForms);
  const rows: MatrixRow[] = [];

  for (const flow of flows) {
    for (const route of flow.routes) {
      const resolution = resolveTemplatesForFlow({ jurisdiction: flow.jurisdiction, product: flow.product, routes: [route] });
      const templatePaths = resolution.templates.map((tpl) => path.normalize(tpl));
      const hbsPaths = templatePaths
        .map((tpl) => path.join("config", "jurisdictions", tpl))
        .filter((tpl) => fs.existsSync(tpl))
        .map((tpl) => path.normalize(tpl));

      const templatePdfPaths = hbsPaths.flatMap((tplPath) => extractPdfReferences(tplPath));
      const officialFormsForFlow = officialIndex.get(`${flow.jurisdiction}/${flow.product}/${route}`) ?? [];
      const notes: string[] = [];
      if (!resolution.registryFound) notes.push("Template registry missing");
      if (resolution.missingOnDisk.length > 0) notes.push(`Templates missing on disk: ${resolution.missingOnDisk.join(", ")}`);
      if (resolution.templates.length === 0) notes.push("No templates resolved");

      rows.push({
        jurisdiction: flow.jurisdiction,
        product: flow.product,
        route,
        mqsFile: flow.mqsFile,
        routeQuestion: flow.routeQuestionId,
        questionIds: flow.questionIds,
        factKeys: flow.factKeys,
        templatePaths,
        hbsPaths,
        templatePdfPaths,
        officialFormKeys: officialFormsForFlow.map((entry) => entry.officialFormKey),
        officialPdfPaths: officialFormsForFlow.map((entry) => entry.pdfPath),
        notes,
      });
    }
  }

  return rows;
}

export function collectOfficialFormCoverage(
  flows: FlowDiscovery[],
  registryEntries: OfficialFormRegistryEntry[] = loadOfficialFormsRegistry(),
): OfficialFormCoverage {
  const referenced = new Set<string>();
  const missing = new Set<string>();
  const whitelist = loadWhitelist();
  const existing = findAllPdfFiles();
  const flowsMissingRegistry: string[] = [];
  const entriesByFlow = buildOfficialFormIndex(registryEntries);

  function requiresOfficialForm(flow: FlowDiscovery) {
    if (flow.product === "eviction_pack" || flow.product === "money_claim") return true;
    if (flow.product === "notice_only" && flow.jurisdiction === "scotland") return true;
    return false;
  }

  for (const flow of flows) {
    for (const route of flow.routes) {
      const key = `${flow.jurisdiction}/${flow.product}/${route}`;
      const entries = entriesByFlow.get(key) ?? [];
      if (requiresOfficialForm(flow) && entries.length === 0) {
        flowsMissingRegistry.push(key);
      }
      for (const entry of entries) {
        const normalizedPath = normalizePdfPath(entry.pdfPath);
        referenced.add(normalizedPath);
        if (!existing.has(normalizedPath) && !whitelist.pdfs.has(normalizedPath)) {
          missing.add(normalizedPath);
        }
      }
    }
  }

  const orphaned = new Set<string>();
  existing.forEach((pdf) => {
    if (whitelist.pdfs.has(pdf)) return;
    if (!referenced.has(pdf)) {
      orphaned.add(pdf);
    }
  });

  return { referenced, existing, missing, orphaned, flowsMissingRegistry, entriesByFlow };
}

export function summarizeCoverage(
  rows: MatrixRow[],
  coverage: TemplateCoverage[],
  pdfs: PdfCoverage,
  officialForms: OfficialFormCoverage,
) {
  const unsupportedFlows: string[] = [];
  const misconfigured: string[] = [];
  const templateGaps: string[] = [];
  const officialFormGaps: string[] = [];
  const officialFormMissing: string[] = [];

  for (const item of coverage) {
    const label = `${item.jurisdiction}/${item.product}/${item.route}`;
    if (!item.registryFound) templateGaps.push(`${label}: registry missing`);
    if (item.missingOnDisk.length > 0) templateGaps.push(`${label}: missing templates ${item.missingOnDisk.join(", ")}`);
    if (item.templates.length === 0) misconfigured.push(`${label}: resolved template list empty`);
  }

  if (officialForms.flowsMissingRegistry.length > 0) {
    officialFormGaps.push(...officialForms.flowsMissingRegistry.map((flow) => `${flow}: official form registry missing`));
  }

  if (officialForms.missing.size > 0) {
    officialFormMissing.push(...Array.from(officialForms.missing).map((pdf) => `official form missing on disk: ${pdf}`));
  }

  const matrix = getCapabilityMatrix();
  for (const jurisdiction of Object.keys(matrix) as Jurisdiction[]) {
    for (const product of Object.keys(matrix[jurisdiction]) as Product[]) {
      const flow = matrix[jurisdiction][product];
      if (flow.status !== "supported") {
        unsupportedFlows.push(`${jurisdiction}/${product}`);
      }
    }
  }

  return {
    unsupportedFlows,
    misconfigured,
    templateGaps,
    orphanTemplates: findOrphanTemplates(new Set(rows.flatMap((row) => row.templatePaths))),
    pdfMissing: Array.from(pdfs.missing).sort(),
    pdfOrphans: Array.from(pdfs.orphaned).sort(),
    officialFormGaps,
    officialFormMissing,
    officialFormOrphans: Array.from(officialForms.orphaned).sort(),
  };
}

export function ensureNoMissingMappings(rows: MatrixRow[]): string[] {
  const issues: string[] = [];

  for (const row of rows) {
    const mapping = getFlowMapping(row.jurisdiction, normalizeProductSlug(row.product), row.route);
    if (!mapping) {
      issues.push(`${row.jurisdiction}/${row.product}/${row.route}: mapping not generated`);
      continue;
    }

    const factKeys = Object.keys(mapping.factKeyToQuestionIds);
    const missingQuestions = mapping.missingQuestionIds;
    if (mapping.unknownFactKeys.length > 0) {
      issues.push(
        `${row.jurisdiction}/${row.product}/${row.route}: unknown fact keys ${mapping.unknownFactKeys.join(", ")}`,
      );
    }
    if (missingQuestions.length > 0) {
      issues.push(`${row.jurisdiction}/${row.product}/${row.route}: missing question ids ${missingQuestions.join(", ")}`);
    }

    for (const factKey of factKeys) {
      if (!row.factKeys.includes(factKey)) {
        issues.push(`${row.jurisdiction}/${row.product}/${row.route}: fact key ${factKey} missing from MQS list`);
      }
    }
  }

  return issues;
}
