import crypto from 'crypto';
import fs from 'fs/promises';

interface DownloadEntry {
  zipPath: string;
  outputDir?: string;
  expiresAt: number;
}

const TOKEN_TTL_MS = 10 * 60 * 1000;

const store: Map<string, DownloadEntry> = (() => {
  const globalStore = globalThis as typeof globalThis & {
    __artifactDownloadStore?: Map<string, DownloadEntry>;
  };
  if (!globalStore.__artifactDownloadStore) {
    globalStore.__artifactDownloadStore = new Map();
  }
  return globalStore.__artifactDownloadStore;
})();

const TMP_PREFIX = '/tmp/';

function isTmpPath(value?: string): boolean {
  return Boolean(value && value.startsWith(TMP_PREFIX));
}

async function cleanupEntry(entry: DownloadEntry): Promise<void> {
  if (entry.outputDir && isTmpPath(entry.outputDir)) {
    await fs.rm(entry.outputDir, { recursive: true, force: true });
    return;
  }
  await fs.rm(entry.zipPath, { force: true });
}

async function cleanupExpiredDownloads(): Promise<void> {
  const now = Date.now();
  const expired: DownloadEntry[] = [];

  for (const [token, entry] of store.entries()) {
    if (now > entry.expiresAt) {
      store.delete(token);
      expired.push(entry);
    }
  }

  await Promise.all(expired.map((entry) => cleanupEntry(entry)));
}

export function registerArtifactDownload(
  zipPath: string,
  outputDir?: string
): { token: string; expiresAt: number } {
  void cleanupExpiredDownloads();
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  store.set(token, { zipPath, outputDir, expiresAt });
  return { token, expiresAt };
}

export async function consumeArtifactDownload(token: string): Promise<DownloadEntry | null> {
  const entry = store.get(token);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(token);
    await cleanupEntry(entry);
    return null;
  }
  store.delete(token);
  return entry;
}

export async function cleanupArtifactDownload(entry: DownloadEntry): Promise<void> {
  await cleanupEntry(entry);
}
