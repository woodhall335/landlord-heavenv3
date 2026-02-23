import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);

const existingNodeOptions = process.env.NODE_OPTIONS?.trim() ?? '';
const warningFlags = [
  '--disable-warning=MODULE_TYPELESS_PACKAGE_JSON',
  '--disable-warning=DEP0180',
];

const nodeOptions = warningFlags.reduce((options, flag) => {
  return options.includes(flag) ? options : `${options} ${flag}`.trim();
}, existingNodeOptions);

const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const result = spawnSync(
  npxCmd,
  ['--no-install', 'ts-node-esm', 'scripts/positioning-audit.ts', ...args],
  {
    stdio: 'inherit',
    shell: false,
    env: {
      ...process.env,
      NODE_OPTIONS: nodeOptions,
    },
  }
);

// If spawn failed (e.g. npx not found), show why.
if (result.error) {
  console.error('[run-positioning-audit] Failed to spawn:', result.error);
  process.exit(1);
}

if (typeof result.status === 'number') {
  process.exit(result.status);
}

process.exit(1);