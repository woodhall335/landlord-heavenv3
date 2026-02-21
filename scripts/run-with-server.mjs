import fs from 'node:fs/promises';
import path from 'node:path';
import net from 'node:net';
import { spawn } from 'node:child_process';

const DEFAULT_PORT = Number(process.env.PORT ?? 3100);
const MAX_PORT_OFFSET = 20;
const READINESS_TIMEOUT_MS = 60000;
const READINESS_INTERVAL_MS = 250;
const outputRoot = path.join(process.cwd(), 'audit-output/funnel/latest');
const logPath = path.join(outputRoot, 'server_run_log.json');

const argv = process.argv.slice(2);
const separatorIndex = argv.indexOf('--');
const commandArgs = separatorIndex >= 0 ? argv.slice(separatorIndex + 1) : argv;

if (!commandArgs.length) {
  console.error('Usage: node scripts/run-with-server.mjs -- <command> [args...]');
  process.exit(1);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function isPortBusy(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(300);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => resolve(false));
    socket.connect(port, '127.0.0.1');
  });
}

async function pickPort(preferredPort) {
  const busyPorts = [];

  for (let offset = 0; offset <= MAX_PORT_OFFSET; offset += 1) {
    const port = preferredPort + offset;
    // eslint-disable-next-line no-await-in-loop
    const busy = await isPortBusy(port);
    if (!busy) return { port, busyPorts };
    busyPorts.push(port);
  }

  throw new Error(`Unable to find a free port from ${preferredPort} to ${preferredPort + MAX_PORT_OFFSET}`);
}

async function waitForReady(baseUrl, serverProcess, readinessState) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < READINESS_TIMEOUT_MS) {
    if (serverProcess.exitCode !== null) {
      throw new Error(`Server process exited before readiness (exit ${serverProcess.exitCode})`);
    }

    try {
      const response = await fetch(baseUrl, { cache: 'no-store' });
      if (response.ok || response.status >= 300) {
        readinessState.ready_time = new Date().toISOString();
        return;
      }
    } catch {
      // wait and retry
    }

    // eslint-disable-next-line no-await-in-loop
    await sleep(READINESS_INTERVAL_MS);
  }

  throw new Error(`Timed out waiting for server readiness at ${baseUrl}`);
}

function killProcessGroup(pid) {
  try {
    process.kill(-pid, 'SIGTERM');
  } catch {
    return;
  }
}

async function stopServer(serverProcess) {
  if (!serverProcess || serverProcess.pid == null) return;

  killProcessGroup(serverProcess.pid);
  await sleep(1000);

  if (serverProcess.exitCode === null) {
    try {
      process.kill(-serverProcess.pid, 'SIGKILL');
    } catch {
      // no-op
    }
  }
}

async function runCommand(command, env) {
  return new Promise((resolve) => {
    const child = spawn(command[0], command.slice(1), {
      stdio: 'inherit',
      env,
      shell: false,
    });

    child.on('exit', (code, signal) => {
      resolve({ code: code ?? 1, signal });
    });
  });
}

async function main() {
  await fs.mkdir(outputRoot, { recursive: true });

  const runLog = {
    requested_port: DEFAULT_PORT,
    port: DEFAULT_PORT,
    pid: null,
    start_time: new Date().toISOString(),
    ready_time: null,
    exit_code: null,
    error_excerpt: null,
    busy_ports_detected: [],
  };

  let serverProcess;
  let serverLogBuffer = "";

  try {
    const { port, busyPorts } = await pickPort(DEFAULT_PORT);
    const baseUrl = `http://localhost:${port}`;

    runLog.port = port;
    runLog.busy_ports_detected = busyPorts;

    serverProcess = spawn('npm', ['run', 'dev', '--', '--port', String(port)], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, PORT: String(port), BASE_URL: baseUrl },
      detached: true,
      shell: false,
    });

    const appendLog = (chunk) => {
      serverLogBuffer = `${serverLogBuffer}${String(chunk)}`.slice(-4000);
      process.stdout.write(chunk);
    };
    const appendErrLog = (chunk) => {
      serverLogBuffer = `${serverLogBuffer}${String(chunk)}`.slice(-4000);
      process.stderr.write(chunk);
    };

    serverProcess.stdout?.on('data', appendLog);
    serverProcess.stderr?.on('data', appendErrLog);

    runLog.pid = serverProcess.pid;

    await waitForReady(baseUrl, serverProcess, runLog);

    const commandResult = await runCommand(commandArgs, { ...process.env, PORT: String(port), BASE_URL: baseUrl });
    runLog.exit_code = commandResult.code;

    if (commandResult.signal) {
      runLog.error_excerpt = `Command exited via signal ${commandResult.signal}`;
    } else if (commandResult.code !== 0) {
      runLog.error_excerpt = serverLogBuffer.slice(-500) || `Command exited with code ${commandResult.code}`;
    }

    await stopServer(serverProcess);

    await fs.writeFile(logPath, `${JSON.stringify(runLog, null, 2)}\n`);

    process.exitCode = commandResult.code;
  } catch (error) {
    const errorText = error instanceof Error ? error.message : String(error);
    runLog.error_excerpt = `${errorText}
${serverLogBuffer}`.trim().slice(0, 500);
    runLog.exit_code = 1;

    if (serverProcess) {
      await stopServer(serverProcess);
    }

    await fs.writeFile(logPath, `${JSON.stringify(runLog, null, 2)}\n`);
    console.error(error);
    process.exitCode = 1;
  }
}

main();
