import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);

// Keep any existing NODE_OPTIONS and add the suppressions if missing
const existingNodeOptions = process.env.NODE_OPTIONS?.trim() ?? '';
const warningFlags = [
  '--disable-warning=MODULE_TYPELESS_PACKAGE_JSON',
  '--disable-warning=DEP0180',
];

const nodeOptions = warningFlags.reduce((options, flag) => {
  return options.includes(flag) ? options : `${options} ${flag}`.trim();
}, existingNodeOptions);

// Resolve project root from this file location (scripts/run-positioning-audit.mjs)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Use ts-node’s ESM CLI entrypoint (NOT the Node loader)
const tsNodeEsmBin = path.join(projectRoot, 'node_modules', 'ts-node', 'dist', 'bin-esm.js');
const auditScript = path.join(projectRoot, 'scripts', 'positioning-audit.ts');

const result = spawnSync(
  process.execPath,
  [tsNodeEsmBin, auditScript, ...args],
  {
    cwd: projectRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: nodeOptions,
    },
  }
);

if (result.error) {
  console.error('[run-positioning-audit] Failed to spawn:', result.error);
  process.exit(1);
}

process.exit(typeof result.status === 'number' ? result.status : 1);