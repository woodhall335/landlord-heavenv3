import fs from "fs";
import path from "path";
import yaml from "js-yaml";

import {
  buildMatrixRows,
  collectOfficialFormCoverage,
  collectPdfCoverage,
  collectTemplateCoverage,
  discoverFlows,
  findAllPdfFiles,
  normalizePdfPath,
} from "./wizardMappingAudit.ts";

export interface LegalRequirementSpec {
  requiredOfficialForms?: string[];
  optionalOfficialForms?: string[];
  requiredTextBlocks?: Array<{
    id: string;
    description: string;
    mustAppearIn: Array<"template" | "official_form" | "either"> | "template" | "official_form" | "either";
    match: string;
    regex?: boolean;
    minOccurrences?: number;
  }>;
  requiredPreconditions?: Array<{
    id: string;
    requiredFactKeys?: string[];
    requiredQuestionIds?: string[];
    mustBeValidatedInFlow?: boolean;
  }>;
  noticeRules?: {
    requiredInputsFactKeys?: string[];
    minimumDays?: number;
    mustComputeExpiryDate?: boolean;
    mustShowUserWarningIfInvalid?: boolean;
  };
  legislationReferences?: string[];
}

export interface MapperResolution {
  routeKey: string;
  mapperFiles: string[];
  mapperTemplates: string[];
  mapperPdfs: string[];
}

export interface ResolvedAssets {
  jurisdiction: string;
  product: string;
  route: string;
  registryTemplates: string[];
  mapperTemplates: string[];
  templateFilePaths: string[];
  referencedPdfsFromTemplates: string[];
  referencedPdfsFromMappers: string[];
  officialFormsExpected: string[];
  officialFormsResolved: string[];
  findings: AuditFinding[];
}

export type Severity = "HIGH" | "MEDIUM" | "LOW";

export interface AuditFinding {
  severity: Severity;
  scope: string;
  message: string;
}

export interface CandidateFormRow {
  pdfPath: string;
  matchedRule: string;
  referencedBy: string;
  suggestion: string;
}

const LEGAL_REQUIREMENTS_ROOT = path.join(process.cwd(), "config", "legal-requirements");
const OFFICIAL_FORM_WHITELIST = path.join(process.cwd(), "audit", "official-form-whitelist.json");
const OFFICIAL_FORMS_MANIFEST = path.join(process.cwd(), "public", "official-forms", "manifest.json");
const OFFICIAL_FORM_CANDIDATE_OUTPUT = path.join(process.cwd(), "audit", "official-form-candidates.csv");
const FLOW_OUTPUT = path.join(process.cwd(), "audit", "flows.json");
const AUDIT_JSON = path.join(process.cwd(), "audit", "legal-validity-audit-v2.1.json");
const AUDIT_MD = path.join(process.cwd(), "audit", "legal-validity-audit-v2.1.md");
const AUDIT_CSV = path.join(process.cwd(), "audit", "legal-validity-audit-v2.1.csv");

export function loadLegalRequirementSpec(jurisdiction: string, route: string): LegalRequirementSpec | null {
  const specPath = path.join(LEGAL_REQUIREMENTS_ROOT, jurisdiction, `${route}.yaml`);
  if (!fs.existsSync(specPath)) return null;
  const raw = fs.readFileSync(specPath, "utf8");
  const parsed = yaml.load(raw) as LegalRequirementSpec;
  return parsed;
}

export function analyzeDocumentMappers(routeKeys: string[]): MapperResolution[] {
  const mapperRoot = path.join(process.cwd(), "src", "lib", "documents");
  const resolutions: MapperResolution[] = [];

  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (!entry.name.endsWith(".ts")) continue;
      const content = fs.readFileSync(fullPath, "utf8");
      for (const routeKey of routeKeys) {
        const normalizedRoute = routeKey.replace(/_/g, "[-_]");
        const matcher = new RegExp(normalizedRoute, "i");
        if (!matcher.test(content)) continue;
        const matches = content.match(/[\w\/-]+\.hbs/gi) || [];
        const pdfs = content.match(/[\w\/-]+\.pdf/gi) || [];
        const resolution = resolutions.find((r) => r.routeKey === routeKey);
        const relPath = path.relative(process.cwd(), fullPath);
        if (resolution) {
          resolution.mapperFiles.push(relPath);
          resolution.mapperTemplates.push(...matches.map((m) => path.normalize(m)));
          resolution.mapperPdfs.push(...pdfs.map((p) => path.normalize(p)));
        } else {
          resolutions.push({
            routeKey,
            mapperFiles: [relPath],
            mapperTemplates: matches.map((m) => path.normalize(m)),
            mapperPdfs: pdfs.map((p) => path.normalize(p)),
          });
        }
      }
    }
  }

  walk(mapperRoot);
  return resolutions.map((r) => ({
    ...r,
    mapperTemplates: Array.from(new Set(r.mapperTemplates)),
    mapperPdfs: Array.from(new Set(r.mapperPdfs)),
    mapperFiles: Array.from(new Set(r.mapperFiles)),
  }));
}

function loadOfficialFormWhitelist(): { allowedPdfsOutsidePublic: Set<string> } {
  if (!fs.existsSync(OFFICIAL_FORM_WHITELIST)) {
    return { allowedPdfsOutsidePublic: new Set() };
  }
  const parsed = JSON.parse(fs.readFileSync(OFFICIAL_FORM_WHITELIST, "utf8"));
  const allowed = Array.isArray(parsed?.allowedPdfsOutsidePublic) ? parsed.allowedPdfsOutsidePublic : [];
  return { allowedPdfsOutsidePublic: new Set(allowed.map((p: string) => path.normalize(p))) };
}

function loadManifest(): { entries: Array<{ jurisdiction: string; route: string; filename: string; version?: string; effective_date?: string }>; missing: boolean } {
  if (!fs.existsSync(OFFICIAL_FORMS_MANIFEST)) {
    return { entries: [], missing: true };
  }
  const parsed = JSON.parse(fs.readFileSync(OFFICIAL_FORMS_MANIFEST, "utf8"));
  const entries = Array.isArray(parsed?.entries) ? parsed.entries : [];
  return { entries, missing: false };
}

const CANDIDATE_RULES: Array<{ regex: RegExp; label: string }> = [
  { regex: /form[_-]?\d+/i, label: "form-number" },
  { regex: /\bn\d{1,4}[a-z]?\b/i, label: "n-form" },
  { regex: /\brhw\d{1,3}\b/i, label: "rhw-form" },
  { regex: /notice[_-]?to[_-]?leave/i, label: "notice-to-leave" },
  { regex: /section[_-]?21/i, label: "section-21" },
  { regex: /section[_-]?8/i, label: "section-8" },
  { regex: /section[_-]?173/i, label: "section-173" },
  { regex: /fault[_-]?based/i, label: "fault-based" },
  { regex: /possession/i, label: "possession" },
  { regex: /claim/i, label: "claim" },
  { regex: /tribunal/i, label: "tribunal" },
  { regex: /sheriff/i, label: "sheriff" },
];

function findPdfCandidates(): CandidateFormRow[] {
  const roots = [
    path.join(process.cwd(), "public", "official-forms"),
    path.join(process.cwd(), "config", "jurisdictions"),
    path.join(process.cwd(), "config", "jurisdictions", "uk", "_official_form_sources"),
  ];
  const allPdfs: string[] = [];

  function walk(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".pdf")) {
        allPdfs.push(path.relative(process.cwd(), fullPath));
      }
    }
  }

  roots.forEach(walk);
  const rows: CandidateFormRow[] = [];

  for (const pdf of allPdfs) {
    for (const rule of CANDIDATE_RULES) {
      if (rule.regex.test(pdf)) {
        rows.push({
          pdfPath: path.normalize(pdf),
          matchedRule: rule.label,
          referencedBy: "orphan",
          suggestion: pdf.startsWith(path.join("public", "official-forms"))
            ? "ensure mapped"
            : "move to /public/official-forms or whitelist",
        });
        break;
      }
    }
  }

  return rows;
}

function applyCandidateReferences(
  candidates: CandidateFormRow[],
  templateRefs: Set<string>,
  mapperRefs: Set<string>,
): CandidateFormRow[] {
  return candidates.map((row) => {
    const normalized = path.normalize(row.pdfPath);
    if (templateRefs.has(normalized)) return { ...row, referencedBy: "template" };
    if (mapperRefs.has(normalized)) return { ...row, referencedBy: "mapper" };
    return row;
  });
}

function writeCsv(filePath: string, rows: Array<Record<string, string>>) {
  if (rows.length === 0) {
    fs.writeFileSync(filePath, "");
    return;
  }
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => JSON.stringify(row[h] ?? "")).join(","));
  }
  fs.writeFileSync(filePath, lines.join("\n"));
}

export function runLegalValidityAuditV21() {
  const flows = discoverFlows();
  fs.writeFileSync(FLOW_OUTPUT, JSON.stringify(flows, null, 2));

  const matrixRows = buildMatrixRows(flows);
  const templateCoverage = collectTemplateCoverage();
  const pdfCoverage = collectPdfCoverage(matrixRows.flatMap((row) => row.templatePaths));
  const officialFormsCoverage = collectOfficialFormCoverage(flows);
  const routeKeys = matrixRows.map((row) => `${row.jurisdiction}/${row.route}`);
  const mapperResolutions = analyzeDocumentMappers(routeKeys);
  const whitelist = loadOfficialFormWhitelist();
  const manifest = loadManifest();
  const manifestIndex = new Map<string, { version?: string; effective_date?: string }>();
  manifest.entries.forEach((entry) => {
    manifestIndex.set(path.join("public", "official-forms", entry.filename), {
      version: entry.version,
      effective_date: entry.effective_date,
    });
  });

  const findings: AuditFinding[] = [];
  if (manifest.missing) {
    findings.push({ severity: "MEDIUM", scope: "manifest", message: "Missing public/official-forms/manifest.json" });
  }

  const resolvedAssets: ResolvedAssets[] = [];
  const templateRefSet = new Set<string>();
  const mapperRefSet = new Set<string>();

  for (const row of matrixRows) {
    const spec = loadLegalRequirementSpec(row.jurisdiction, row.route);
    const registryTemplates = row.templatePaths;
    const templateFilePaths = row.hbsPaths;
    const referencedPdfsFromTemplates = row.templatePdfPaths.map((p) => path.normalize(p));
    referencedPdfsFromTemplates.forEach((p) => templateRefSet.add(p));

    const mapperResolution = mapperResolutions.find((m) => m.routeKey === `${row.jurisdiction}/${row.route}`);
    const mapperTemplates = mapperResolution?.mapperTemplates ?? [];
    const referencedPdfsFromMappers = (mapperResolution?.mapperPdfs ?? []).map((p) => normalizePdfPath(p));
    referencedPdfsFromMappers.forEach((p) => mapperRefSet.add(p));

    const officialFormsExpected = spec?.requiredOfficialForms?.map(normalizePdfPath) ?? [];
    const officialFormsResolved = row.officialPdfPaths.map(normalizePdfPath);

    const routeFindings: AuditFinding[] = [];
    if (!spec) {
      routeFindings.push({ severity: "HIGH", scope: `${row.jurisdiction}/${row.route}`, message: "Missing legal requirement spec" });
    }

    if (spec?.requiredPreconditions) {
      for (const pre of spec.requiredPreconditions) {
        const missingFacts = (pre.requiredFactKeys || []).filter((key) => !row.factKeys.includes(key));
        const missingQuestions = (pre.requiredQuestionIds || []).filter((q) => !row.questionIds.includes(q));
        if (missingFacts.length > 0 || missingQuestions.length > 0) {
          routeFindings.push({
            severity: "HIGH",
            scope: `${row.jurisdiction}/${row.route}`,
            message: `Precondition ${pre.id} missing facts ${missingFacts.join(" ") || "none"} questions ${missingQuestions.join(" ") || "none"}`,
          });
        }
      }
    }

    if (spec?.requiredTextBlocks) {
      for (const block of spec.requiredTextBlocks) {
        const targets = Array.isArray(block.mustAppearIn) ? block.mustAppearIn : [block.mustAppearIn];
        const matcher = block.regex ? new RegExp(block.match, "i") : null;
        let occurrences = 0;
        for (const tplPath of templateFilePaths) {
          if (!fs.existsSync(tplPath)) continue;
          const content = fs.readFileSync(tplPath, "utf8");
          if (matcher ? matcher.test(content) : content.includes(block.match)) {
            occurrences += 1;
          }
        }
        const min = block.minOccurrences ?? 1;
        if (occurrences < min && targets.includes("template")) {
          routeFindings.push({
            severity: "HIGH",
            scope: `${row.jurisdiction}/${row.route}`,
            message: `Required text block ${block.id} missing in templates`,
          });
        }
      }
    }

    if (spec?.noticeRules) {
      const missingFacts = (spec.noticeRules.requiredInputsFactKeys || []).filter((key) => !row.factKeys.includes(key));
      if (missingFacts.length > 0) {
        routeFindings.push({
          severity: "HIGH",
          scope: `${row.jurisdiction}/${row.route}`,
          message: `Notice rule inputs missing facts ${missingFacts.join(", ")}`,
        });
      }
      if (spec.noticeRules.mustComputeExpiryDate && !row.factKeys.some((k) => k.includes("expiry") || k.includes("end_date"))) {
        routeFindings.push({
          severity: "MEDIUM",
          scope: `${row.jurisdiction}/${row.route}`,
          message: "Notice expiry date computation not detected",
        });
      }
    }

    const requiresFormsForRow =
      officialFormsExpected.length > 0 &&
      (row.product === "eviction_pack" ||
        row.product === "money_claim" ||
        (row.product === "notice_only" && row.jurisdiction === "scotland"));

    if (requiresFormsForRow && officialFormsResolved.length === 0) {
      routeFindings.push({
        severity: "HIGH",
        scope: `${row.jurisdiction}/${row.route}`,
        message: "Spec requires official form but none mapped",
      });
    }

    for (const required of requiresFormsForRow ? officialFormsExpected : []) {
      if (!officialFormsResolved.includes(required)) {
        routeFindings.push({
          severity: "HIGH",
          scope: `${row.jurisdiction}/${row.route}`,
          message: `Expected official form ${required} not in registry`,
        });
      }
      if (!findAllPdfFiles().has(required)) {
        routeFindings.push({
          severity: "HIGH",
          scope: `${row.jurisdiction}/${row.route}`,
          message: `Official form ${required} missing on disk`,
        });
      }
      if (!required.startsWith(path.join("public", "official-forms"))) {
        const severity: Severity = whitelist.allowedPdfsOutsidePublic.has(required) ? "MEDIUM" : "HIGH";
        routeFindings.push({
          severity,
          scope: `${row.jurisdiction}/${row.route}`,
          message: `Official form ${required} outside /public/official-forms`,
        });
      }
    }

    if (manifestIndex.size > 0) {
      for (const form of officialFormsResolved) {
        const manifestEntry = manifestIndex.get(form);
        if (!manifestEntry) {
          routeFindings.push({ severity: "MEDIUM", scope: `${row.jurisdiction}/${row.route}`, message: `Form ${form} missing from manifest` });
        }
      }
    }

    const registryOnly = registryTemplates.filter((tpl) => !mapperTemplates.includes(tpl));
    const mapperOnly = mapperTemplates.filter((tpl) => !registryTemplates.includes(tpl));
    if (registryOnly.length > 0) {
      routeFindings.push({ severity: "MEDIUM", scope: `${row.jurisdiction}/${row.route}`, message: `Registry-only templates: ${registryOnly.join(", ")}` });
    }
    if (mapperOnly.length > 0) {
      routeFindings.push({ severity: "HIGH", scope: `${row.jurisdiction}/${row.route}`, message: `Mapper-only templates: ${mapperOnly.join(", ")}` });
    }

    resolvedAssets.push({
      jurisdiction: row.jurisdiction,
      product: row.product,
      route: row.route,
      registryTemplates,
      mapperTemplates,
      templateFilePaths,
      referencedPdfsFromTemplates,
      referencedPdfsFromMappers,
      officialFormsExpected,
      officialFormsResolved,
      findings: routeFindings,
    });
    findings.push(...routeFindings);
  }

  const candidateRows = applyCandidateReferences(findPdfCandidates(), templateRefSet, mapperRefSet);
  writeCsv(
    OFFICIAL_FORM_CANDIDATE_OUTPUT,
    candidateRows.map((row) => ({
      pdfPath: row.pdfPath,
      matchedRule: row.matchedRule,
      referencedBy: row.referencedBy,
      suggestion: row.suggestion,
    })),
  );

  const coverageRows = resolvedAssets.map((asset) => {
    const severityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 } as const;
    const worst = asset.findings.reduce<Severity | null>((acc, f) => {
      if (!acc) return f.severity;
      return severityOrder[f.severity] > severityOrder[acc] ? f.severity : acc;
    }, null);
    const status = worst === "HIGH" ? "FAIL" : worst === "MEDIUM" ? "PARTIAL" : "PASS";
    return {
      jurisdiction: asset.jurisdiction,
      product: asset.product,
      route: asset.route,
      status,
      officialForms: asset.officialFormsResolved.join("; ") || "-",
      templateChecks: asset.findings.some((f) => f.message.includes("template")) ? "issues" : "ok",
      preconditions: asset.findings.some((f) => f.message.includes("Precondition")) ? "issues" : "ok",
      noticeRules: asset.findings.some((f) => f.message.includes("Notice")) ? "issues" : "ok",
      mapperConsistency: asset.findings.some((f) => f.message.includes("Mapper")) ? "issues" : "ok",
      notes: asset.findings.map((f) => `${f.severity}: ${f.message}`).join(" | ") || "-",
    };
  });

  writeCsv(AUDIT_CSV, coverageRows);

  const summary = {
    flowsDiscovered: flows.length,
    templatesResolved: templateCoverage.coverage.length,
    pdfsFound: pdfCoverage.existing.size,
    officialFormsReferenced: officialFormsCoverage.referenced.size,
    candidateFormsOutsidePublic: candidateRows.filter((row) => !row.pdfPath.startsWith(path.join("public", "official-forms"))).length,
    findings,
    coverage: coverageRows,
  };

  fs.writeFileSync(AUDIT_JSON, JSON.stringify({ summary, resolvedAssets, candidateRows }, null, 2));

  const mdLines: string[] = [];
  mdLines.push("# Legal Validity Audit v2.1");
  mdLines.push("\n## Audit Summary");
  mdLines.push(`- Flows discovered: ${flows.length}`);
  mdLines.push(`- Templates resolved: ${templateCoverage.coverage.length}`);
  mdLines.push(`- PDFs found: ${pdfCoverage.existing.size}`);
  mdLines.push(`- Official form references: ${officialFormsCoverage.referenced.size}`);
  mdLines.push(`- Candidate PDFs outside public: ${summary.candidateFormsOutsidePublic}`);
  mdLines.push(`- Manifest present: ${manifest.missing ? "no" : "yes"}`);
  const blocking = findings.filter((f) => f.severity === "HIGH");
  mdLines.push(`- Blocking issues: ${blocking.length}`);
  mdLines.push("\n## Coverage table");
  mdLines.push("| jurisdiction | product | route | status | officialForms | templateChecks | preconditions | noticeRules | mapperConsistency | notes |");
  mdLines.push("| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |");
  for (const row of coverageRows) {
    mdLines.push(
      `| ${row.jurisdiction} | ${row.product} | ${row.route} | ${row.status} | ${row.officialForms || "-"} | ${row.templateChecks} | ${row.preconditions} | ${row.noticeRules} | ${row.mapperConsistency} | ${row.notes || "-"} |`,
    );
  }

  mdLines.push("\n## Issues by severity");
  mdLines.push("### HIGH");
  blocking.forEach((f) => mdLines.push(`- ${f.scope}: ${f.message}`));
  mdLines.push("### MEDIUM");
  findings
    .filter((f) => f.severity === "MEDIUM")
    .forEach((f) => mdLines.push(`- ${f.scope}: ${f.message}`));
  mdLines.push("### LOW");
  findings
    .filter((f) => f.severity === "LOW")
    .forEach((f) => mdLines.push(`- ${f.scope}: ${f.message}`));

  mdLines.push("\n## Official Forms Coverage");
  for (const asset of resolvedAssets) {
    mdLines.push(
      `- ${asset.jurisdiction}/${asset.route}: expected [${asset.officialFormsExpected.join(", ") || "-"}], mapped [${asset.officialFormsResolved.join(", ") || "-"}]`,
    );
  }

  mdLines.push("\n## Official Form Candidates Found Outside /public/official-forms");
  candidateRows
    .filter((row) => !row.pdfPath.startsWith(path.join("public", "official-forms")))
    .forEach((row) => mdLines.push(`- ${row.pdfPath} (${row.matchedRule}) [${row.referencedBy}]`));

  mdLines.push("\nScanned /public/official-forms with total PDFs: " + Array.from(findAllPdfFiles()).filter((p) => p.startsWith("public/official-forms")).length);

  fs.writeFileSync(AUDIT_MD, mdLines.join("\n"));

  const highFindings = findings.filter((f) => f.severity === "HIGH");
  if (highFindings.length > 0) {
    // eslint-disable-next-line no-console
    console.error("Audit failed with HIGH findings", highFindings);
    process.exitCode = 1;
  }
}
