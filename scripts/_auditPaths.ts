import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

type AuditOutDirOptions = {
  latest?: boolean;
  timestamp?: string;
};

export async function ensureDir(dirPath: string) {
  await fs.mkdir(dirPath, { recursive: true });
}

function formatTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

export function auditOutDir(name: string, options: AuditOutDirOptions = {}) {
  const leaf = options.latest ? 'latest' : (options.timestamp || formatTimestamp());
  return path.join(ROOT, 'audit-output', name, leaf);
}

export async function writeJSON(filePath: string, obj: unknown) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, `${JSON.stringify(obj, null, 2)}\n`);
}

export async function writeJSONL(filePath: string, rows: unknown[]) {
  await ensureDir(path.dirname(filePath));
  const data = rows.map((row) => JSON.stringify(row)).join('\n');
  await fs.writeFile(filePath, data ? `${data}\n` : '');
}
