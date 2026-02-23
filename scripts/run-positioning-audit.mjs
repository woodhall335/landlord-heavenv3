import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const existingNodeOptions = process.env.NODE_OPTIONS?.trim();
const warningFlag = '--disable-warning=MODULE_TYPELESS_PACKAGE_JSON';
const nodeOptions = existingNodeOptions
  ? `${existingNodeOptions} ${warningFlag}`
  : warningFlag;

const result = spawnSync('ts-node-esm', ['scripts/positioning-audit.ts', ...args], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_OPTIONS: nodeOptions,
  },
});

if (typeof result.status === 'number') {
  process.exit(result.status);
}

process.exit(1);
