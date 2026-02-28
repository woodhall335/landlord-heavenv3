import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const forwardedArgs = process.argv.slice(2);

const existingNodeOptions = process.env.NODE_OPTIONS?.trim() ?? '';
const warningFlags = [
  '--disable-warning=MODULE_TYPELESS_PACKAGE_JSON',
  '--disable-warning=DEP0180',
];

const nodeOptions = warningFlags.reduce((options, flag) => {
  return options.includes(flag) ? options : `${options} ${flag}`.trim();
}, existingNodeOptions);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const tsNodeEsmBin = path.resolve(projectRoot, 'node_modules', 'ts-node', 'dist', 'bin-esm.js');
const auditScript = path.resolve(projectRoot, 'scripts', 'positioning-audit.ts');
const nodeBin = process.execPath;
const childArgs = [tsNodeEsmBin, auditScript, ...forwardedArgs];

if (!existsSync(tsNodeEsmBin)) {
  console.error(`[run-positioning-audit] Missing ts-node bin-esm entrypoint at: ${tsNodeEsmBin}`);
  process.exit(1);
}

if (!existsSync(auditScript)) {
  console.error(`[run-positioning-audit] Missing audit script at: ${auditScript}`);
  process.exit(1);
}

if (process.env.LH_AUDIT_DEBUG === '1') {
  console.error('[run-positioning-audit] Debug info:');
  console.error(`  node: ${nodeBin}`);
  console.error(`  args: ${JSON.stringify(childArgs)}`);
  console.error(`  cwd: ${projectRoot}`);
  console.error(`  NODE_OPTIONS: ${nodeOptions}`);
}

const child = spawn(nodeBin, childArgs, {
  cwd: projectRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_OPTIONS: nodeOptions,
  },
  shell: false,
});

child.on('error', (error) => {
  console.error('[run-positioning-audit] Failed to spawn audit process:', error);
  process.exit(1);
});

child.on('close', (code, signal) => {
  if (signal) {
    console.error(`[run-positioning-audit] Audit process terminated by signal: ${signal}`);
    process.exit(1);
  }

  process.exit(typeof code === 'number' ? code : 1);
});
