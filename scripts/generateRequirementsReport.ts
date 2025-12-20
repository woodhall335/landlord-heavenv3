/**
 * Generate Requirements Coverage Report
 *
 * Analyzes requirements engine against MQS mappings to ensure all required facts
 * are collectible via wizard questions.
 */

import { getRequirements, ValidationContext } from '../src/lib/jurisdictions/requirements';
import { getCapabilityMatrix, type Jurisdiction, type Product } from '../src/lib/jurisdictions/capabilities/matrix';
import { getFlowMapping } from '../src/lib/mqs/mapping.generated';

interface RequirementsCoverage {
  jurisdiction: Jurisdiction;
  product: Product;
  route: string;
  stage: 'preview' | 'generate';
  requiredFacts: string[];
  warnedFacts: string[];
  derivedFacts: string[];
  unmappedRequired: string[]; // Required facts without MQS mapping
  unmappedWarned: string[]; // Warned facts without MQS mapping
}

function generateReport() {
  const matrix = getCapabilityMatrix();
  const coverage: RequirementsCoverage[] = [];

  for (const [jurisdiction, products] of Object.entries(matrix)) {
    for (const [product, flow] of Object.entries(products)) {
      if (flow.status !== 'supported') continue;

      for (const route of flow.routes) {
        // Check preview and generate stages
        for (const stage of ['preview', 'generate'] as const) {
          const ctx: ValidationContext = {
            jurisdiction: jurisdiction as Jurisdiction,
            product: product as Product,
            route,
            stage,
            facts: {
              // Provide minimal facts to avoid triggering conditional requirements
              deposit_taken: false,
              has_gas_appliances: false,
              is_fixed_term: false,
              joint_tenants: false,
              joint_landlords: false,
            },
          };

          const requirements = getRequirements(ctx);

          if (requirements.status !== 'ok') {
            console.error(`Skipping ${jurisdiction}/${product}/${route} - status: ${requirements.status}`);
            continue;
          }

          const mapping = getFlowMapping(
            jurisdiction as Jurisdiction,
            product as Product,
            route
          );

          const unmappedRequired: string[] = [];
          const unmappedWarned: string[] = [];

          // Check if each required fact has MQS mapping or is derived
          for (const factKey of requirements.requiredNow) {
            if (requirements.derived.has(factKey)) continue; // Derived facts are OK

            const questionIds = mapping?.factKeyToQuestionIds[factKey] || [];
            if (questionIds.length === 0) {
              unmappedRequired.push(factKey);
            }
          }

          // Check warned facts
          for (const factKey of requirements.warnNow) {
            if (requirements.derived.has(factKey)) continue;

            const questionIds = mapping?.factKeyToQuestionIds[factKey] || [];
            if (questionIds.length === 0) {
              unmappedWarned.push(factKey);
            }
          }

          coverage.push({
            jurisdiction: jurisdiction as Jurisdiction,
            product: product as Product,
            route,
            stage,
            requiredFacts: Array.from(requirements.requiredNow),
            warnedFacts: Array.from(requirements.warnNow),
            derivedFacts: Array.from(requirements.derived),
            unmappedRequired,
            unmappedWarned,
          });
        }
      }
    }
  }

  return coverage;
}

function formatMarkdownReport(coverage: RequirementsCoverage[]): string {
  let md = '# Requirements Engine Coverage Report\n\n';
  md += `Generated: ${new Date().toISOString()}\n\n`;

  // Summary
  const totalFlows = new Set(coverage.map(c => `${c.jurisdiction}/${c.product}/${c.route}`)).size;
  const flowsWithUnmapped = new Set(
    coverage
      .filter(c => c.unmappedRequired.length > 0)
      .map(c => `${c.jurisdiction}/${c.product}/${c.route}`)
  ).size;

  md += '## Summary\n\n';
  md += `- Total supported flows: ${totalFlows}\n`;
  md += `- Flows with unmapped required facts: ${flowsWithUnmapped}\n`;
  md += `- Status: ${flowsWithUnmapped === 0 ? '✅ PASS' : '❌ FAIL'}\n\n`;

  if (flowsWithUnmapped > 0) {
    md += '## ❌ Unmapped Required Facts\n\n';
    md += 'These facts are marked as required but have no MQS question mapping:\n\n';

    for (const item of coverage) {
      if (item.unmappedRequired.length === 0) continue;

      md += `### ${item.jurisdiction}/${item.product}/${item.route} (${item.stage})\n\n`;
      for (const fact of item.unmappedRequired) {
        md += `- ❌ \`${fact}\` - NO MQS MAPPING\n`;
      }
      md += '\n';
    }
  }

  // Requirements by flow
  md += '## Requirements by Flow\n\n';

  const flowGroups = new Map<string, RequirementsCoverage[]>();
  for (const item of coverage) {
    const key = `${item.jurisdiction}/${item.product}/${item.route}`;
    if (!flowGroups.has(key)) {
      flowGroups.set(key, []);
    }
    flowGroups.get(key)!.push(item);
  }

  for (const [flowKey, items] of flowGroups) {
    md += `### ${flowKey}\n\n`;

    for (const item of items) {
      md += `#### Stage: ${item.stage}\n\n`;

      md += `**Required (${item.requiredFacts.length}):**\n`;
      if (item.requiredFacts.length > 0) {
        for (const fact of item.requiredFacts.sort()) {
          const isUnmapped = item.unmappedRequired.includes(fact);
          const isDerived = item.derivedFacts.includes(fact);
          const icon = isUnmapped ? '❌' : isDerived ? '🔄' : '✅';
          md += `- ${icon} \`${fact}\`${isDerived ? ' (derived)' : ''}${isUnmapped ? ' (NO MQS MAPPING)' : ''}\n`;
        }
      } else {
        md += '- None\n';
      }
      md += '\n';

      if (item.warnedFacts.length > 0) {
        md += `**Warned (${item.warnedFacts.length}):**\n`;
        for (const fact of item.warnedFacts.sort()) {
          md += `- ⚠️ \`${fact}\`\n`;
        }
        md += '\n';
      }

      if (item.derivedFacts.length > 0) {
        md += `**Derived/Optional (${item.derivedFacts.length}):**\n`;
        for (const fact of item.derivedFacts.sort()) {
          md += `- 🔄 \`${fact}\`\n`;
        }
        md += '\n';
      }
    }
  }

  return md;
}

// Main execution
const coverage = generateReport();
const report = formatMarkdownReport(coverage);

console.log(report);

// Write to file
import * as fs from 'fs';
import * as path from 'path';

const reportPath = path.join(process.cwd(), 'REQUIREMENTS_COVERAGE.md');
fs.writeFileSync(reportPath, report, 'utf8');

console.log(`\n✅ Report written to ${reportPath}`);

// Exit with error code if there are unmapped facts
const hasUnmapped = coverage.some(c => c.unmappedRequired.length > 0);
if (hasUnmapped) {
  console.error('\n❌ FAILURE: Some required facts have no MQS mapping!');
  process.exit(1);
} else {
  console.log('\n✅ SUCCESS: All required facts have MQS mappings!');
  process.exit(0);
}
