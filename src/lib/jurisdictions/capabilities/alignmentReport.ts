import fs from "fs";
import path from "path";

import type { CapabilityBuildReport, CapabilityMatrix, FlowCapability } from "./matrix";
import type { MissingFact } from "../facts/referenceScanner";

function renderFlowList(flows: FlowCapability[]): string {
  if (flows.length === 0) return "None";
  return flows
    .map((flow) => `- ${flow.jurisdiction} / ${flow.product} (${flow.routes.join(", ")})`)
    .join("\n");
}

function renderReportSection(title: string, items: { jurisdiction: string; product: string; reason: string; routes: string[]; mqsFile?: string }[]): string {
  if (!items.length) return `## ${title}\nNone\n`;
  const lines = items.map((item) => {
    const mqs = item.mqsFile ? ` | MQS: ${item.mqsFile}` : "";
    return `- ${item.jurisdiction} / ${item.product} (${item.routes.join(", ")}) — ${item.reason}${mqs}`;
  });
  return `## ${title}\n${lines.join("\n")}\n`;
}

export function buildCapabilityAlignmentReport(
  matrix: CapabilityMatrix,
  report: CapabilityBuildReport,
  missingFacts: MissingFact[] = [],
): string {
  const supported: FlowCapability[] = [];
  for (const jurisdiction of Object.keys(matrix)) {
    const products = matrix[jurisdiction as keyof CapabilityMatrix];
    for (const capability of Object.values(products)) {
      if (capability.status === "supported") {
        supported.push(capability);
      }
    }
  }

  const missingFactsSection = missingFacts.length
    ? [
        "## Missing Facts Schema Coverage",
        ...missingFacts.map((item) => {
          const refs = item.references
            .map((ref) => {
              const line = ref.source.line ? `:${ref.source.line}` : "";
              const question = ref.source.questionId ? ` question ${ref.source.questionId}` : "";
              return `  - ${ref.source.type} -> ${ref.source.file}${line}${question}`;
            })
            .join("\n");
          return `- ${item.jurisdiction} / ${item.key}\n${refs}`;
        }),
      ].join("\n")
    : "## Missing Facts Schema Coverage\nNone";

  const parts = [
    "# UK Capability Alignment Report",
    "",
    "## Supported Flows",
    renderFlowList(supported),
    renderReportSection("Misconfigured Flows", report.misconfigured),
    renderReportSection("Template Registry Gaps", report.templateRegistryGaps),
    renderReportSection("Route Question Issues", report.routeQuestionIssues),
    missingFactsSection,
  ];

  return parts.join("\n");
}

export function writeCapabilityAlignmentReport(
  matrix: CapabilityMatrix,
  report: CapabilityBuildReport,
  outputPath = path.join(process.cwd(), "ALIGNMENT_REPORT.uk_packs.md"),
  missingFacts: MissingFact[] = [],
): void {
  const content = buildCapabilityAlignmentReport(matrix, report, missingFacts);
  fs.writeFileSync(outputPath, content, "utf8");
}
