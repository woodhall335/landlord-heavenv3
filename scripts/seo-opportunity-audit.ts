import {
  buildSeoOpportunityAudit,
  renderSeoOpportunityAuditMarkdown,
} from '@/lib/seo/opportunity-audit';

async function main() {
  const result = await buildSeoOpportunityAudit();
  process.stdout.write(renderSeoOpportunityAuditMarkdown(result));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
