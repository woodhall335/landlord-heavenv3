import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const forwardedArgs = process.argv.slice(2);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const auditScript = path.resolve(projectRoot, 'scripts', 'positioning-audit.ts');
const npxBin = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const childArgs = ['-p', 'node@20', '-p', 'tsx', 'tsx', auditScript, ...forwardedArgs];

if (!existsSync(auditScript)) {
  console.error(`[run-positioning-audit] Missing audit script at: ${auditScript}`);
  process.exit(1);
}

if (process.env.LH_AUDIT_DEBUG === '1') {
  console.error('[run-positioning-audit] Debug info:');
  console.error(`  runner: ${npxBin}`);
  console.error(`  args: ${JSON.stringify(childArgs)}`);
  console.error(`  cwd: ${projectRoot}`);
}

const child = spawn(npxBin, childArgs, {
  cwd: projectRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
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
