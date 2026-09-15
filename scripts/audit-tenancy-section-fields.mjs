import fs from 'node:fs';
import yaml from 'js-yaml';
const flow = fs.readFileSync('src/components/wizard/flows/TenancySectionFlow.tsx', 'utf8');
const rendered = new Set([...flow.matchAll(/onUpdate\(\{\s*(\w+)\s*:/g)].map(m => m[1]));
const validator = fs.readFileSync('src/lib/validation/tenancy-details-validator.ts', 'utf8');
function section(name) {
  if (/Product/.test(name)) return 'product';
  if (/Property Details/.test(name)) return 'property';
  if (/Landlord/.test(name)) return 'landlord';
  if (/Tenants|Contract-holders/.test(name)) return 'tenants';
  if (/Tenancy|Contract/.test(name)) return 'tenancy';
  if (/Rent.*Payments|Rent Details/.test(name)) return 'rent';
  if (/Deposit/.test(name)) return 'deposit';
  if (/Bills/.test(name)) return 'bills';
  if (/Safety|Required NI/.test(name)) return 'compliance';
  if (/Premium/.test(name)) return 'premium';
  return 'terms';
}
const catalog = {};
for (const jurisdiction of ['england', 'wales', 'scotland', 'northern-ireland']) {
  const questions = yaml.load(fs.readFileSync(`config/mqs/tenancy_agreement/${jurisdiction}.yaml`, 'utf8')).questions;
  catalog[jurisdiction] = [];
  for (const q of questions) {
    if (q.deprecated || q.section === 'Evidence' || q.section === 'Product' || /Tenants|Contract-holders/.test(q.section || '')) continue;
    for (const f of q.fields || [q]) {
      if (!['text', 'textarea', 'number', 'currency', 'date', 'select', 'yes_no', 'email', 'tel'].includes(f.inputType)) continue;
      if (!f.validation?.required && !f.required && !validator.includes(f.id)) continue;
      catalog[jurisdiction].push({ id: f.id, label: f.label || q.question, inputType: f.inputType,
        section: section(q.section || ''), options: f.options, required: f.validation?.required || f.required,
        helperText: f.helperText, dependsOn: f.dependsOn, parentDependsOn: q.dependsOn,
        renderedInSectionFlow: rendered.has(f.id) });
    }
  }
  if (jurisdiction === 'wales' || jurisdiction === 'scotland') {
    for (const id of ['landlord_2_email', 'landlord_2_phone']) catalog[jurisdiction].push({ id, label: id.endsWith('email') ? 'Second landlord email' : 'Second landlord phone', inputType: 'text', section: 'landlord', required: true, dependsOn: { questionId: 'joint_landlord', value: true } });
  }
  if (jurisdiction === 'northern-ireland') catalog[jurisdiction].push({ id: 'agreement_date', label: 'Agreement date', inputType: 'date', section: 'tenancy', required: true });
}
const outputPath = 'src/lib/wizard/tenancy-supplemental-fields.json';
const output = JSON.stringify(catalog, null, 2) + '\n';
const standaloneFlow = fs.readFileSync('src/lib/residential-letting/standalone-flow-config.ts', 'utf8');
const validatorLiteralFields = new Set(
  [...validator.matchAll(/(?:missing|invalid)\.add\(['`]([^'`$]+)['`]/g)].map(match => match[1]),
);
const unreachableValidatorFields = [...validatorLiteralFields].filter(
  field => !flow.includes(field) && !standaloneFlow.includes(field) && !output.includes(`"id": "${field}"`),
);
if (unreachableValidatorFields.length > 0) {
  console.error(`Validator fields without a wizard control: ${unreachableValidatorFields.join(', ')}`);
  process.exitCode = 1;
}
if (process.argv.includes('--check')) {
  if (!fs.existsSync(outputPath) || fs.readFileSync(outputPath, 'utf8') !== output) {
    console.error('Tenancy section field catalog is stale. Run: node scripts/audit-tenancy-section-fields.mjs');
    process.exitCode = 1;
  }
} else {
  fs.writeFileSync(outputPath, output);
}
console.log(Object.fromEntries(Object.entries(catalog).map(([j, fields]) => [j, fields.length])));
