import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_APP_DIR = path.join(process.cwd(), 'src', 'app');

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const out: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      continue;
    }

    const absPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walk(absPath)));
      continue;
    }

    out.push(absPath);
  }

  return out;
}

export function routePathFromPageFile(appDir: string, absFilePath: string): string {
  const rel = absFilePath.slice(appDir.length).split(path.sep).join('/');
  const segs = rel.split('/').filter(Boolean);

  if (segs.at(-1) !== 'page.tsx') {
    return '/';
  }

  segs.pop();
  return segs.length ? `/${segs.join('/')}` : '/';
}

export async function discoverStaticPageRoutes(appDir: string = DEFAULT_APP_DIR): Promise<string[]> {
  const files = await walk(appDir);
  const routes = new Set<string>();

  for (const filePath of files) {
    if (!filePath.endsWith('page.tsx') || filePath.includes(`${path.sep}__tests__${path.sep}`)) {
      continue;
    }

    const routePath = routePathFromPageFile(appDir, filePath);
    if (!routePath.includes('[')) {
      routes.add(routePath);
    }
  }

  return [...routes].sort((a, b) => a.localeCompare(b));
}
