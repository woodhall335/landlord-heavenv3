import crypto from 'crypto';

interface DownloadEntry {
  zipPath: string;
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

export function registerArtifactDownload(zipPath: string): { token: string; expiresAt: number } {
  const token = crypto.randomUUID();
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  store.set(token, { zipPath, expiresAt });
  return { token, expiresAt };
}

export function consumeArtifactDownload(token: string): DownloadEntry | null {
  const entry = store.get(token);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(token);
    return null;
  }
  store.delete(token);
  return entry;
}
