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

// Use npx because `ts-node-esm` may not be on PATH on Windows,
// but `npx ts-node-esm ...` reliably resolves the local binary.
const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const result = spawnSync(
  npxCmd,
  ['--no-install', 'ts-node-esm', 'scripts/positioning-audit.ts', ...args],
  {
    stdio: 'inherit',
    // shell:false is fine here; we're explicitly calling npx(.cmd)
    shell: false,
    env: {
      ...process.env,
      NODE_OPTIONS: nodeOptions,
    },
  }
);

if (typeof result.status === 'number') {
  process.exit(result.status);
}

process.exit(1);