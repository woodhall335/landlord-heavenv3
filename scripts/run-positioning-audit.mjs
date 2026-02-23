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

// Quote for cmd.exe: wrap in "..." only when needed,
// and escape embedded quotes by doubling them.
function cmdQuote(s) {
  const str = String(s);
  // Quote if it contains whitespace or common cmd metacharacters
  if (!/[ \t&()^[\]{}=;!'+,`~|<>"]/g.test(str)) return str;
  return `"${str.replaceAll('"', '""')}"`;
}

let result;

if (process.platform === 'win32') {
  const comspec = process.env.ComSpec || 'cmd.exe';

  const parts = [
    'npx',
    '--no-install',
    'ts-node-esm',
    'scripts/positioning-audit.ts',
    ...args,
  ];

  // IMPORTANT: don't add backslashes. cmd.exe wants raw quotes.
  const command = parts.map(cmdQuote).join(' ');

  result = spawnSync(comspec, ['/d', '/s', '/c', command], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: nodeOptions,
    },
  });
} else {
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