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

function quoteArg(arg) {
  // Basic safe quoting for cmd.exe /c
  // Wrap in double quotes and escape any embedded double quotes
  return `"${String(arg).replaceAll('"', '\\"')}"`;
}

let result;

if (process.platform === 'win32') {
  const comspec = process.env.ComSpec || 'cmd.exe';
  const cmd = [
    'npx',
    '--no-install',
    'ts-node-esm',
    'scripts/positioning-audit.ts',
    ...args,
  ]
    .map(quoteArg)
    .join(' ');

  // Run via cmd.exe so .cmd resolution works
  result = spawnSync(comspec, ['/d', '/s', '/c', cmd], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: nodeOptions,
    },
  });
} else {
  // Non-Windows: npx is executable directly
  result = spawnSync(
    'npx',
    ['--no-install', 'ts-node-esm', 'scripts/positioning-audit.ts', ...args],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_OPTIONS: nodeOptions,
      },
    }
  );
}

if (result.error) {
  console.error('[run-positioning-audit] Failed to spawn:', result.error);
  process.exit(1);
}

process.exit(typeof result.status === 'number' ? result.status : 1);