import fs from 'node:fs/promises';
import path from 'node:path';

const outputRoot = path.join(process.cwd(), 'audit-output/env/latest');
const outputPath = path.join(outputRoot, 'env_check.json');

const checks = [
  { key: 'NODE_ENV', group: 'app_runtime' },
  { key: 'BASE_URL', group: 'app_runtime' },
  { key: 'NEXT_PUBLIC_SITE_URL', group: 'app_runtime' },
  { key: 'NEXT_PUBLIC_BASE_URL', group: 'app_runtime' },
  { key: 'NEXT_PUBLIC_SUPABASE_URL', group: 'supabase' },
  { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', group: 'supabase' },
  { key: 'SUPABASE_SERVICE_ROLE_KEY', group: 'supabase' },
  { key: 'STRIPE_SECRET_KEY', group: 'stripe' },
  { key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', group: 'stripe' },
  { key: 'STRIPE_WEBHOOK_SECRET', group: 'stripe' },
  { key: 'RESEND_API_KEY', group: 'email' },
  { key: 'EMAIL_FROM', group: 'email' },
  { key: 'E2E_MODE', group: 'e2e' },
  { key: 'NEXT_PUBLIC_E2E_MODE', group: 'e2e' },
];

const grouped = {};
const flat = {};

for (const { key, group } of checks) {
  const present = Boolean(process.env[key] && `${process.env[key]}`.trim().length > 0);
  if (!grouped[group]) grouped[group] = [];
  grouped[group].push({ key, present, value_preview: present ? '[set]' : '[missing]' });
  flat[key] = present ? 'present' : 'absent';
}

console.log('Audit environment checklist');
for (const [group, entries] of Object.entries(grouped)) {
  console.log(`\n[${group}]`);
  for (const entry of entries) {
    console.log(` - ${entry.present ? '✅' : '❌'} ${entry.key}: ${entry.value_preview}`);
  }
}

await fs.mkdir(outputRoot, { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify({ generated_at: new Date().toISOString(), checks: flat }, null, 2)}\n`);
console.log(`\nWrote JSON report: ${outputPath}`);
