import { spawnSync } from 'node:child_process';
import path from 'node:path';

const args = process.argv.slice(2);

const existingNodeOptions = process.env.NODE_OPTIONS?.trim() ?? '';
const warningFlags = [
  '--disable-warning=MODULE_TYPELESS_PACKAGE_JSON',
  '--disable-warning=DEP0180',
];

const nodeOptions = warningFlags.reduce((options, flag) => {
  return options.includes(flag) ? options : `${options} ${flag}`.trim();
}, existingNodeOptions);

// Prefer the locally-installed ts-node-esm binary for reliability.
// This avoids npx/cmd.exe quoting issues on Windows.
const tsNodeEsmBin =
  process.platform === 'win32'
    ? path.join('node_modules', '.bin', 'ts-node-esm.cmd')
    : path.join('node_modules', '.bin', 'ts-node-esm');

const childArgs = ['scripts/positioning-audit.ts', ...args];

const result = spawnSync(tsNodeEsmBin, childArgs, {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_OPTIONS: nodeOptions,
  },
});

if (result.error) {
  console.error('[run-positioning-audit] Failed to spawn:', result.error);
  console.error('[run-positioning-audit] Tried:', tsNodeEsmBin, childArgs.join(' '));
  process.exit(1);
}

process.exit(typeof result.status === 'number' ? result.status : 1);