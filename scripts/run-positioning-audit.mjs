import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);

// Preserve existing NODE_OPTIONS and append warning suppressions (if missing)
const existingNodeOptions = process.env.NODE_OPTIONS?.trim() ?? '';
const warningFlags = [
  '--disable-warning=MODULE_TYPELESS_PACKAGE_JSON',
  '--disable-warning=DEP0180',
];

const nodeOptions = warningFlags.reduce((options, flag) => {
  return options.includes(flag) ? options : `${options} ${flag}`.trim();
}, existingNodeOptions);

// Optional debug output: set LH_AUDIT_DEBUG=1
const debug = process.env.LH_AUDIT_DEBUG === '1';

// Resolve ts-node ESM CLI entrypoint directly (no .cmd shims)
const tsNodeEsmCli = path.resolve('node_modules', 'ts-node', 'dist', 'bin-esm.js');

if (!existsSync(tsNodeEsmCli)) {
  console.error('[run-positioning-audit] ts-node ESM CLI not found:', tsNodeEsmCli);
  console.error('[run-positioning-audit] Have you installed dependencies? Try: npm install');
  process.exit(1);
}

const auditEntrypoint = path.resolve('scripts', 'positioning-audit.ts');

const nodeExe = process.execPath; // the current Node binary
const nodeArgs = [tsNodeEsmCli, auditEntrypoint, ...args];

if (debug) {
  console.error('[run-positioning-audit] node:', nodeExe);
  console.error('[run-positioning-audit] args:', nodeArgs.join(' '));
  console.error('[run-positioning-audit] cwd:', process.cwd());
  console.error('[run-positioning-audit] NODE_OPTIONS:', nodeOptions);
}

const result = spawnSync(nodeExe, nodeArgs, {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_OPTIONS: nodeOptions,
  },
});

if (result.error) {
  console.error('[run-positioning-audit] Failed to spawn:', result.error);
  process.exit(1);
}

process.exit(typeof result.status === 'number' ? result.status : 1);