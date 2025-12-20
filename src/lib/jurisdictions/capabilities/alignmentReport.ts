import fs from "fs";
import path from "path";

import type { CapabilityBuildReport, CapabilityMatrix, FlowCapability } from "./matrix";

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

export function buildCapabilityAlignmentReport(matrix: CapabilityMatrix, report: CapabilityBuildReport): string {
  const supported: FlowCapability[] = [];
  for (const jurisdiction of Object.keys(matrix)) {
    const products = matrix[jurisdiction as keyof CapabilityMatrix];
    for (const capability of Object.values(products)) {
      if (capability.status === "supported") {
        supported.push(capability);
      }
    }
  }

  const parts = [
    "# UK Capability Alignment Report",
    "",
    "## Supported Flows",
    renderFlowList(supported),
    renderReportSection("Misconfigured Flows", report.misconfigured),
    renderReportSection("Template Registry Gaps", report.templateRegistryGaps),
    renderReportSection("Route Question Issues", report.routeQuestionIssues),
  ];

  return parts.join("\n");
}

export function writeCapabilityAlignmentReport(
  matrix: CapabilityMatrix,
  report: CapabilityBuildReport,
  outputPath = path.join(process.cwd(), "ALIGNMENT_REPORT.uk_packs.md"),
): void {
  const content = buildCapabilityAlignmentReport(matrix, report);
  fs.writeFileSync(outputPath, content, "utf8");
}
