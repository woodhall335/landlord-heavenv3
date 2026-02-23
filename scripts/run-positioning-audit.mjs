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

// Quote for cmd.exe: wrap in "..." only when needed,
// and escape embedded quotes by doubling them.
function cmdQuote(s) {
  const str = String(s);
  // Quote if it contains whitespace or common cmd metacharacters
  if (!/[ \t&()^[\]{}=;!'+,`~|<>"]/g.test(str)) return str;
  return `"${str.replaceAll('"', '""')}"`;
}

const env = {
  ...process.env,
  NODE_OPTIONS: nodeOptions,
};

const childArgs = ['scripts/positioning-audit.ts', ...args];

let result;

if (process.platform === 'win32') {
  const comspec = process.env.ComSpec || 'cmd.exe';

  // Use the local shim, but run it THROUGH cmd.exe (critical).
  const tsNodeEsmCmd = path.resolve('node_modules', '.bin', 'ts-node-esm.cmd');

  // Build a single command line for cmd.exe
  const command = [tsNodeEsmCmd, ...childArgs].map(cmdQuote).join(' ');

  result = spawnSync(comspec, ['/d', '/s', '/c', command], {
    stdio: 'inherit',
    env,
  });
} else {
  // POSIX: execute the local bin directly
  const tsNodeEsmBin = path.resolve('node_modules', '.bin', 'ts-node-esm');

  result = spawnSync(tsNodeEsmBin, childArgs, {
    stdio: 'inherit',
    env,
  });
}

if (result.error) {
  console.error('[run-positioning-audit] Failed to spawn:', result.error);
  process.exit(1);
}

process.exit(typeof result.status === 'number' ? result.status : 1);