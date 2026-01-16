#!/usr/bin/env tsx

import fs from "fs";
import path from "path";

import {
  buildMatrixRows,
  collectPdfCoverage,
  collectOfficialFormCoverage,
  collectTemplateCoverage,
  discoverFlows,
  ensureNoMissingMappings,
  loadOfficialFormsRegistry,
  summarizeCoverage,
  type MatrixRow,
} from "../src/lib/audit/wizardMappingAudit.ts";

function writeFile(filePath: string, content: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

function toCsv(rows: MatrixRow[]): string {
  const header = [
    "jurisdiction",
    "product",
    "route",
    "mqsFile",
    "routeQuestion",
    "questionIds",
    "factKeys",
    "templateKeys",
    "hbsPaths",
    "templatePdfPaths",
    "officialFormKeys",
    "officialPdfPaths",
    "notes",
  ];

  const lines = rows.map((row) =>
    [
      row.jurisdiction,
      row.product,
      row.route,
      row.mqsFile,
      row.routeQuestion ?? "",
      row.questionIds.join(";"),
      row.factKeys.join(";"),
      row.templatePaths.join(";"),
      row.hbsPaths.join(";"),
      row.templatePdfPaths.join(";"),
      row.officialFormKeys.join(";"),
      row.officialPdfPaths.join(";"),
      row.notes.join(" | "),
    ]
      .map((value) => `"${value.replace(/"/g, '""')}"`)
      .join(","),
  );

  return [header.join(","), ...lines].join("\n");
}

function toMarkdown(rows: MatrixRow[]): string {
  const header = [
    "jurisdiction",
    "product",
    "route",
    "mqsFile",
    "routeQuestion",
    "questionIds",
    "factKeys",
    "templateKeys",
    "hbsPaths",
    "templatePdfPaths",
    "officialFormKeys",
    "officialPdfPaths",
    "notes",
  ];

  const md: string[] = [];
  md.push("| " + header.join(" | ") + " |");
  md.push("|" + header.map(() => " --- ").join("|") + "|");

  for (const row of rows) {
    const values = [
      row.jurisdiction,
      row.product,
      row.route,
      row.mqsFile,
      row.routeQuestion ?? "",
      row.questionIds.join("<br>") || "-",
      row.factKeys.join("<br>") || "-",
      row.templatePaths.join("<br>") || "-",
      row.hbsPaths.join("<br>") || "-",
      row.templatePdfPaths.join("<br>") || "-",
      row.officialFormKeys.join("<br>") || "-",
      row.officialPdfPaths.join("<br>") || "-",
      row.notes.join("<br>") || "-",
    ];
    md.push("| " + values.map((v) => (v === "" ? "-" : v)).join(" | ") + " |");
  }

  return md.join("\n");
}

function formatCoverageTable(rows: MatrixRow[], blockingIssues: string[]) {
  const blockingSet = new Set(blockingIssues);
  const header = "| jurisdiction | product | route | status | notes |\n| --- | --- | --- | --- | --- |";
  const lines = rows.map((row) => {
    const label = `${row.jurisdiction}/${row.product}/${row.route}`;
    const isBlocked = [...blockingSet].some((issue) => issue.includes(label));
    const status = isBlocked ? "BROKEN" : row.notes.length ? "PARTIAL" : "OK";
    const notes = [...row.notes, ...[...blockingSet].filter((issue) => issue.includes(label))].join("<br>") || "-";
    return `| ${row.jurisdiction} | ${row.product} | ${row.route} | ${status} | ${notes} |`;
  });
  return [header, ...lines].join("\n");
}

function buildAuditReport(
  rows: MatrixRow[],
  coverageIssues: ReturnType<typeof summarizeCoverage>,
  pdfs: ReturnType<typeof collectPdfCoverage>,
  mappingIssues: string[],
  officialCoverage: ReturnType<typeof collectOfficialFormCoverage>,
): string {
  const totalFlows = rows.length;
  const totalTemplates = rows.reduce((acc, row) => acc + row.templatePaths.length, 0);
  const totalPdfs = pdfs.existing.size;
  const totalOfficialForms = officialCoverage.referenced.size;
  const blocking = [
    ...coverageIssues.misconfigured,
    ...coverageIssues.templateGaps,
    ...coverageIssues.officialFormGaps,
    ...coverageIssues.officialFormMissing,
    ...mappingIssues,
    ...pdfs.missing,
    ...coverageIssues.officialFormOrphans,
  ];

  const summary = [
    `- Flows discovered: ${totalFlows}`,
    `- Templates referenced: ${totalTemplates}`,
    `- PDFs found (templates + official forms): ${totalPdfs}`,
    `- Official form PDFs referenced via registry: ${totalOfficialForms}`,
    "- Scan roots: config/jurisdictions/** and public/official-forms/**",
    `- Blocking issues: ${blocking.length}`,
    `- Orphan templates: ${coverageIssues.orphanTemplates.length}`,
    `- Orphan PDFs: ${coverageIssues.pdfOrphans.length}`,
  ].join("\n");

  const issuesList = [
    ...coverageIssues.templateGaps.map((i) => `- HIGH: ${i}`),
    ...coverageIssues.misconfigured.map((i) => `- HIGH: ${i}`),
    ...mappingIssues.map((i) => `- HIGH: ${i}`),
    ...coverageIssues.orphanTemplates.map((i) => `- MEDIUM: orphan template ${i}`),
    ...coverageIssues.pdfMissing.map((i) => `- HIGH: missing PDF ${i}`),
    ...coverageIssues.pdfOrphans.map((i) => `- MEDIUM: orphan PDF ${i}`),
    ...coverageIssues.officialFormGaps.map((i) => `- HIGH: ${i}`),
    ...coverageIssues.officialFormMissing.map((i) => `- HIGH: ${i}`),
    ...coverageIssues.officialFormOrphans.map((i) => `- HIGH: orphan official form ${i}`),
  ];

  return [
    "# Legal Validity Audit",
    "",
    "## Audit Summary",
    summary,
    "",
    "## Coverage",
    formatCoverageTable(rows, blocking),
    "",
    "## Issues",
    issuesList.length ? issuesList.join("\n") : "- None",
    "",
    "## Legal vs Technical Risk",
    "- Legal risk: jurisdiction/template mismatches, missing official PDFs",
    "- Technical risk: orphan templates and registry gaps reduce determinism",
  ].join("\n");
}

function main() {
  const flows = discoverFlows();
  const officialForms = loadOfficialFormsRegistry();
  const rows = buildMatrixRows(flows, officialForms);
  const { coverage, referencedTemplates } = collectTemplateCoverage();
  const officialCoverage = collectOfficialFormCoverage(flows, officialForms);
  const pdfs = collectPdfCoverage(referencedTemplates, officialCoverage.referenced);
  const coverageIssues = summarizeCoverage(rows, coverage, pdfs, officialCoverage);
  const mappingIssues = ensureNoMissingMappings(rows);

  const auditDir = path.join(process.cwd(), "audit");
  writeFile(path.join(auditDir, "mapping-matrix.csv"), toCsv(rows));
  writeFile(path.join(auditDir, "mapping-matrix.md"), toMarkdown(rows));
  writeFile(
    path.join(auditDir, "legal-validity-audit.md"),
    buildAuditReport(rows, coverageIssues, pdfs, mappingIssues, officialCoverage),
  );

  const blocking = [
    ...coverageIssues.misconfigured,
    ...coverageIssues.templateGaps,
    ...coverageIssues.officialFormGaps,
    ...coverageIssues.officialFormMissing,
    ...mappingIssues,
    ...coverageIssues.orphanTemplates,
    ...coverageIssues.pdfMissing,
    ...coverageIssues.pdfOrphans,
    ...coverageIssues.officialFormOrphans,
  ];

  if (coverageIssues.officialFormOrphans.length > 0) {
    console.error(
      'Found generated/timestamped PDF in canonical official forms dir. Remove it and re-run. This directory must contain only stable official PDFs.',
    );
    console.error('Offending files:');
    for (const orphan of coverageIssues.officialFormOrphans) {
      console.error(`- ${orphan}`);
    }
    console.error('');
  }

  if (blocking.length > 0) {
    console.error("Validation failed:\n" + blocking.join("\n"));
    process.exit(1);
  }

  console.log("Wizard mapping validation completed successfully.");
}

main();
